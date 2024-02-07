from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.db.models import Q

from apps.finance.models import LoonAccount, LoonCapitalFlow
from service.base_service import BaseService
from service.common.log_service import auto_log


class FinanceBaseService(BaseService):
    @classmethod
    @auto_log
    def get_account_list(cls, search_value: str, page: int=1, per_page: int=10)->tuple:
        """
        获取角色列表
        get role restful list by search params
        :param search_value: role name or role description Support fuzzy queries
        :param page:
        :param per_page:
        :return:
        """
        query_params = Q(is_deleted=False)
        if search_value:
            query_params &= Q(holder__contains=search_value) | Q(description__contains=search_value) | Q(card_number__contains=search_value)
        account_objects = LoonAccount.objects.filter(query_params)
        paginator = Paginator(account_objects, per_page)
        try:
            account_result_paginator = paginator.page(page)
        except PageNotAnInteger:
            account_result_paginator = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results
            account_result_paginator = paginator.page(paginator.num_pages)
        account_result_object_list = account_result_paginator.object_list
        account_result_object_format_list = []
        for account_result_object in account_result_object_list:
            account_result_object.initial_balance_amount = float(account_result_object.initial_balance_amount)
            account_result_object.balance_amount = float(account_result_object.balance_amount)
            account_result_object_format_list.append(account_result_object.get_dict())

        return True, dict(account_result_object_format_list=account_result_object_format_list,
                          paginator_info=dict(per_page=per_page, page=page, total=paginator.count))

    @classmethod
    @auto_log
    # 后端校验
    def add_account(cls, holder: str, card_number: str, card_bank: str, initial_balance_amount: float,
                    balance_amount: float, creator: str,  modifier: str, description: str='')->tuple:
        """
        add role
        新增角色
        :param name:
        :param description:
        :param label:
        :param creator:
        :return:
        """
        account_obj = LoonAccount(holder=holder, card_number=card_number, card_bank=card_bank, initial_balance_amount=initial_balance_amount,
                                  balance_amount=balance_amount, creator=creator, modifier=modifier, description=description)
        account_obj.save()
        return True, dict(account_id=account_obj.id)
    @classmethod
    @auto_log
    def update_account(cls, account_id: str, description: str, modifier: str, gmt_modified) -> tuple:
        account_queryset = LoonAccount.objects.filter(id=account_id, is_deleted=0)
        if not account_queryset:
            return False, 'account record is not existed'
        if description == '':
            description = account_queryset.description
        account_queryset.update(description=description, modifier=modifier, gmt_modified=gmt_modified)
        return True, {}

    @classmethod
    @auto_log
    def delete_account(cls, account_id: int)->tuple:
        """
        delete role record
        删除角色
        :param role_id:
        :return:
        """
        account_queryset = LoonAccount.objects.filter(id=account_id, is_deleted=0)
        if not account_queryset:
            return False, 'account record is not existed'
        account_queryset.update(is_deleted=1)
        return True, {}

    @classmethod
    @auto_log
    def get_capital_flow_list(cls, card_bank: str='', card_number: str='', capital_flow_type: str='', create_start: str='', create_end: str='',
                        reverse: int=1, per_page: int=10, page: int=1, **kwargs)->tuple:
        """
        获取角色列表
        get role restful list by search params
        :param search_value: role name or role description Support fuzzy queries
        :param page:
        :param per_page:
        :return:
        """
        query_params = Q(is_deleted=False)
        if card_bank:
            query_params &= Q(account__card_bank__contains=card_bank)
        if card_number:
            query_params &= Q(account__card_number__contains=card_number)
        if capital_flow_type:
            if capital_flow_type == "1":
                query_params &= Q(capital_flow_type="收入")
            else:
                query_params &= Q(capital_flow_type="支出")
        if create_start:
            query_params &= Q(gmt_created__gte=create_start)
        if create_end:
            query_params &= Q(gmt_created__lte=create_end)
        if reverse:
            order_by_str = '-gmt_created'
        else:
            order_by_str = 'gmt_created'


        capital_flow_objects = LoonCapitalFlow.objects.filter(query_params).order_by(order_by_str)
        paginator = Paginator(capital_flow_objects, per_page)
        try:
            capital_flow_result_paginator = paginator.page(page)
        except PageNotAnInteger:
            capital_flow_result_paginator = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results
            capital_flow_result_paginator = paginator.page(paginator.num_pages)
        capital_flow_result_object_list = capital_flow_result_paginator.object_list
        capital_flow_result_object_format_list = []

        for capital_flow_result_object in capital_flow_result_object_list:
            capital_flow_result_object_format_dict = dict()
            capital_flow_result_object_format_dict["creator"]=capital_flow_result_object.creator
            capital_flow_result_object_format_dict["gmt_created"]=capital_flow_result_object.gmt_created.strftime("%Y-%m-%d %H:%M:%S")
            capital_flow_result_object_format_dict["card_bank"]=capital_flow_result_object.account.card_bank
            capital_flow_result_object_format_dict["card_number"]=capital_flow_result_object.account.card_number
            capital_flow_result_object_format_dict["account_balance_amount_before"]=float(capital_flow_result_object.account_balance_amount_before)
            capital_flow_result_object_format_dict["account_balance_amount_after"]=float(capital_flow_result_object.account_balance_amount_after)
            capital_flow_result_object_format_dict["total"]=float(capital_flow_result_object.total)
            capital_flow_result_object_format_dict["capital_flow_type"]=capital_flow_result_object.capital_flow_type
            capital_flow_result_object_format_dict["ticket_record_id"]=capital_flow_result_object.ticket_record.id

            capital_flow_result_object_format_list.append(capital_flow_result_object_format_dict)

        return True, dict(capital_flow_result_object_format_list=capital_flow_result_object_format_list,
                          paginator_info=dict(per_page=per_page, page=page, total=paginator.count))



finance_base_service_ins = FinanceBaseService()