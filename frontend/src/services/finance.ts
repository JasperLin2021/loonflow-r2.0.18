import { request } from 'umi';

// 前端校验
export interface getAccountListType{
  search_value?: string,
  page?: number,
  per_page?: number
}


export interface updateAccountType {
  holder: string,
  description?: string,
  card_number?: string,
  initial_balance_amount?: number
}

export interface updateAccountType {
  name: string,
  description?: string,
  label?: string
}


export interface getCapitalFlowListType{
  search_value?: string,
  page?: number,
  per_page?: number
}

export async function getAccountList(params: getAccountListType) {
  return request<API.CommonResponse> ('/api/v1.0/finance/account', {
    method: 'get',
    params: params
  })
}

export async function addAccount(params: updateAccountType) {
  return request<API.CommonResponse> ('/api/v1.0/finance/account', {
    method: 'post',
    data: params
  })
}

export async function delAccountRequest(AccountId: number){
  return request<API.CommonResponse> (`/api/v1.0/finance/account/${AccountId}`,{
    method: 'delete',
  })
}

export async function updateAccount(AccountId: number, params: updateAccountType) {
  return request<API.CommonResponse> (`/api/v1.0/finance/account/${AccountId}`, {
    method: 'patch',
    data: params
  })
}


export async function getCapitalFlowList(params: getCapitalFlowListType) {
  return request<API.CommonResponse> ('/api/v1.0/finance/capitalflow', {
    method: 'get',
    params: params
  })
}
