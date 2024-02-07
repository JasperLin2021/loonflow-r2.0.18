import json
from datetime import datetime

from _decimal import Decimal
from schema import Schema, And, Optional, Use

from apps.loon_base_view import LoonBaseView
from service.finance.finance_base_service import finance_base_service_ins
from service.format_response import api_response

def convert_to_decimal(value):
    try:
        return Decimal(value)
    except (TypeError, ValueError):
        raise ValueError('initial_balance_amount must be a number')

# Create your views here.
class LoonAccountView(LoonBaseView):
    # 用于验证POST请求数据的模式
    post_schema = Schema({
        'holder': And(str, lambda n: n != ''),
        'card_number': And(str, lambda n: n != ''),
        'card_bank': And(str, lambda n: n != ''),
        'initial_balance_amount': And(Use(convert_to_decimal), lambda n: n != ''),
        Optional('description'): str,
    })


    def get(self, request, *args, **kwargs):
        """
        用户角色列表
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        request_data = request.GET
        search_value = request_data.get('search_value', '')
        per_page = int(request_data.get('per_page', 10))
        page = int(request_data.get('page', 1))
        flag, result = finance_base_service_ins.get_account_list(search_value, page, per_page)
        if flag is not False:
            data = dict(value=result.get('account_result_object_format_list'),
                        per_page=result.get('paginator_info').get('per_page'),
                        page=result.get('paginator_info').get('page'),
                        total=result.get('paginator_info').get('total'))
            code, msg, = 0, ''
        else:
            code, data = -1, ''
        return api_response(code, msg, data)

    def post(self, request, *args, **kwargs):
        """
        add role
        新增角色
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        json_str = request.body.decode('utf-8')
        request_data_dict = json.loads(json_str)
        holder = request_data_dict.get('holder')
        card_number = request_data_dict.get('card_number')
        card_bank = request_data_dict.get('card_bank')
        description = request_data_dict.get('description')
        initial_balance_amount = balance_amount = request_data_dict.get('initial_balance_amount')
        modifier = creator = request.user.username

        flag, result = finance_base_service_ins.add_account(holder=holder, card_number=card_number, card_bank=card_bank, initial_balance_amount=initial_balance_amount,
                                                         balance_amount=balance_amount, creator=creator, modifier=modifier, description=description)
        if flag is False:
            return api_response(-1, result, {})
        return api_response(0, result, {})


class LoonAccountDetailView(LoonBaseView):
    post_schema = Schema({
        'account_id': And(str, lambda n: n != ''),
        Optional('description'): str,
    })

    def patch(self, request, *args, **kwargs):
        """
        update role
        更新角色信息
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        account_id = kwargs.get('account_id')
        json_str = request.body.decode('utf-8')
        request_data_dict = json.loads(json_str)
        description = request_data_dict.get('description')
        modifier = request.user.username
        gmt_modified = datetime.now()
        flag, result = finance_base_service_ins.update_account(account_id, description, modifier, gmt_modified)
        if flag is False:
            return api_response(-1, result, {})
        return api_response(0, '', {})

    def delete(self, request, *args, **kwargs):
        """
        delete role
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        account_id = kwargs.get('account_id')
        flag, result = finance_base_service_ins.delete_account(account_id)
        if flag is False:
            return api_response(-1, result, {})
        return api_response(0, '', {})


class LoonCapitalFlowView(LoonBaseView):
    def get(self, request, *args, **kwargs):
        """
        用户角色列表
        :param request:
        :param args:
        :param kwargs:
        :return:
        """

        request_data = request.GET

        # username = request.META.get('HTTP_USERNAME')
        card_bank = request_data.get('card_bank', '')
        card_number = request_data.get('card_number', '')
        capital_flow_type = request_data.get('capital_flow_type')
        create_start = request_data.get('create_start', '')
        create_end = request_data.get('create_end', '')
        reverse = int(request_data.get('reverse', 1))
        per_page = int(request_data.get('per_page', 10))
        page = int(request_data.get('page', 1))

        # 未指定创建起止时间则取最近三年的记录
        if not(create_start or create_end):
            import datetime
            end_time = datetime.datetime.now() + datetime.timedelta(hours=1)
            last_year_time = datetime.datetime.now() - datetime.timedelta(days=7)
            create_start = str(last_year_time)[:19]
            create_end = str(end_time)[:19]


        flag, result = finance_base_service_ins.get_capital_flow_list(card_bank=card_bank, card_number=card_number, capital_flow_type=capital_flow_type,
                                                                      create_start=create_start, create_end=create_end, reverse=reverse,
                                                                      per_page=per_page, page=page)
        if flag is not False:
            data = dict(value=result.get('capital_flow_result_object_format_list'),
                        per_page=result.get('paginator_info').get('per_page'),
                        page=result.get('paginator_info').get('page'),
                        total=result.get('paginator_info').get('total'))
            code, msg, = 0, ''
        else:
            code, data = -1, ''
        return api_response(code, msg, data)