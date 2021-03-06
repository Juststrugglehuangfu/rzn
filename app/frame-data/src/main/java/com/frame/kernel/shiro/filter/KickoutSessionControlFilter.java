package com.frame.kernel.shiro.filter;

import com.frame.kernel.user.model.User;
import org.apache.shiro.cache.Cache;
import org.apache.shiro.cache.CacheManager;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.mgt.DefaultSessionKey;
import org.apache.shiro.session.mgt.SessionManager;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.filter.AccessControlFilter;
import org.apache.shiro.web.util.WebUtils;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import java.io.Serializable;
import java.util.Deque;
import java.util.Iterator;
import java.util.LinkedList;

/**
 * 控制并发登录filter
 * @author
 * @date 2019年3月22日
 */
public class KickoutSessionControlFilter extends AccessControlFilter {

    private String kickoutUrl; //踢出后到的地址
    private boolean kickoutAfter = false; //踢出之前登录的/之后登录的用户 默认踢出之前登录的用户
    private int maxSession = 1; //同一个帐号最大会话数 默认1

    private SessionManager sessionManager;

    private Cache<String, Deque<Serializable>> cache;

    public void setKickoutUrl(String kickoutUrl) {
        this.kickoutUrl = kickoutUrl;
    }

    public void setKickoutAfter(boolean kickoutAfter) {
        this.kickoutAfter = kickoutAfter;
    }

    public void setMaxSession(int maxSession) {
        this.maxSession = maxSession;
    }

    public void setSessionManager(SessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    public void setCacheManager(CacheManager cacheManager) {
        this.cache = cacheManager.getCache("shiro-kickout-session");
    }

    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) throws Exception {
        return false;
    }

    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
        Subject subject = getSubject(request, response);
        if(!subject.isAuthenticated() && !subject.isRemembered()) {
            //如果没有登录，直接进行之后的流程
            return true;
        }

        Session session = subject.getSession();
        String username = ((User)subject.getPrincipal()).getUser_name();
        Serializable sessionId = session.getId();

        //TODO 同步控制
        Deque<Serializable> deque = cache.get(username);
        if(deque == null) {
            deque = new LinkedList<Serializable>();
            cache.put(username, deque);
        }

        Iterator<Serializable> dequeIte =  deque.iterator();
        while(dequeIte.hasNext()){
            Serializable dequeIteSessionId = dequeIte.next();
            try{
                Session dequeIteSession =   sessionManager.getSession(new DefaultSessionKey(dequeIteSessionId));
                if(dequeIteSession == null) {
                    deque.removeLastOccurrence(dequeIteSessionId);
                }
            }catch (Exception e){
                deque.removeLastOccurrence(dequeIteSessionId);
            }


        }

        //如果队列里没有此sessionId，且用户没有被踢出；放入队列
        if(!deque.contains(sessionId) && session.getAttribute("kickout") == null) {
            deque.push(sessionId);
            cache.put(username, deque);
        }


        Serializable kickoutSessionIdLastOut = null;
        //如果队列里的sessionId数超出最大会话数，开始踢人
        while(deque.size() > maxSession) {
            Serializable kickoutSessionId = null;
            if(kickoutAfter) { //如果踢出后者
                kickoutSessionId = deque.removeFirst();
            } else { //否则踢出前者
                kickoutSessionId = deque.removeLast();
            }
            cache.put(username, deque);
            try {
                Session kickoutSession = sessionManager.getSession(new DefaultSessionKey(kickoutSessionId));
                if(kickoutSession != null) {
                    //设置会话的kickout属性表示踢出了
                    kickoutSession.setAttribute("kickout", true);
                    kickoutSessionIdLastOut = kickoutSession.getId();

                }
            } catch (Exception e) {//ignore exception
            }
        }

        //如果被踢出了，直接退出，重定向到踢出后的地址
        if ( null != session.getAttribute("kickout")||(null!=kickoutSessionIdLastOut &&session.getId().equals(kickoutSessionIdLastOut))) {
            //会话被踢出了
            try {
                subject.logout();

            } catch (Exception e) { //ignore
            }
            saveRequest(request);
            getSubject(request, response).getSession().setAttribute("errorMessage","该账户以及在其他终端登录");
            WebUtils.issueRedirect(request, response, kickoutUrl);
            return false;
        }

        return true;
    }

}
