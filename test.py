# result = [{'id': 1, 'holder': '张三', 'card_number': '123', 'initial_balance_amount': '100.00', 'balance_amount':'100.00', 'creator': 'admin', 'gmt_created': '2024-02-02 14:28:25', 'gmt_modified': '2024-02-02 14:28:25', 'is_deleted': False, 'description': ''}, {'id': 2, 'holder': '李四', 'card_number': '456', 'initial_balance_amount': '200.00', 'balance_amount': '200.00', 'creator': 'admin', 'gmt_created': '2024-02-02 14:31:43', 'gmt_modified': '2024-02-02 14:31:43', 'is_deleted': False, 'description': '222'}]
# result = {'account_result_object_format_list': [{'id': 1, 'holder': '张三', 'card_number': '123', 'initial_balance_amount': '100.00', 'balance_amount': '100.00', 'creator': 'admin', 'gmt_created': '2024-02-02 14:28:25', 'gmt_modified': '2024-02-02 14:28:25', 'is_deleted': False, 'description': ''}, {'id': 2, 'holder': '李四', 'card_number': '456', 'initial_balance_amount': '200.00', 'balance_amount': '200.00', 'creator': 'admin', 'gmt_created': '2024-02-02 14:31:43', 'gmt_modified': '2024-02-02 14:31:43', 'is_deleted': False, 'description': '222'}], 'paginator_info': {'per_page': 10, 'page': 1, 'total': 2}}
from datetime import datetime

from django.utils import timezone

# data = dict(value=result.get('account_result_object_format_list'))
data = datetime.now()

print(data)
