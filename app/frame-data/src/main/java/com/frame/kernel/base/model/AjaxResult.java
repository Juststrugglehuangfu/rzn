package com.frame.kernel.base.model;

import java.util.HashMap;
import java.util.Map;

/**

 */
public class AjaxResult {

	// 标记成功失败，默认0：成功，1：失败、用于alert，2：失败、用于confirm
	private int code = 0;

	// 返回的中文消息
	private String message;

	// 成功时携带的数据
	private Object data;

	public int getCode() {
		return code;
	}

	public String getMessage() {
		return message;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

	// 校验错误
	public boolean hasError() {
		return this.code != 0;
	}

	// 添加错误，用于alertError
	public AjaxResult addError(String message) {
		this.message = message;
		this.code = 1;
		return this;
	}
	private Map<String,Object> result = new HashMap<>();

	public Map<String,Object> put(String key,String value){
		 result.put(key,value);
		return result;
	}

	/**
	 * 用于Confirm的错误信息
	 * 
	 * @param message
	 * @return AjaxResult
	 */
	public AjaxResult addConfirmError(String message) {
		this.message = message;
		this.code = 2;
		return this;
	}

	/**
	 * 用于操作成功信息
	 * 
	 * @param message
	 * @return AjaxResult
	 */
	public AjaxResult success(String message) {
		this.message = message;
		this.data = result;
		return this;
	}

	/**
	 * 封装成功时的数据
	 * 
	 * @param data
	 * @return AjaxResult
	 */
	public AjaxResult success(Object data) {
		this.data = data;
		return this;
	}

	/**
	 * 用于操作成功信息
	 * 
	 * @param message
	 * @return AjaxResult
	 */
	public AjaxResult success(String message, Object data) {
		this.message = message;
		this.data = data;
		return this;
	}


}
