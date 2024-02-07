from django.db import models

from apps.loon_base_model import BaseModel
from apps.ticket.models import TicketRecord
from extensions.models import AmountField


# Create your models here.

class LoonAccount(BaseModel):
    """
    结算管理
    """
    holder = models.CharField(max_length=64, null=True, blank=True, verbose_name='开户人')
    card_number = models.CharField(max_length=64, null=True, blank=True, verbose_name='开户账号')
    card_bank = models.CharField(max_length=64, null=True, blank=True, verbose_name='开户行')
    initial_balance_amount = AmountField(default=0, verbose_name='初期余额')
    balance_amount = AmountField(default=0, verbose_name='余额')
    creator = models.CharField('创建人', max_length=50)
    modifier = models.CharField('修改人', null=True, max_length=50)
    gmt_created = models.DateTimeField('创建时间', auto_now_add=True)
    gmt_modified = models.DateTimeField('更新时间', auto_now=True)
    is_deleted = models.BooleanField('已删除', default=False)
    description = models.CharField('描述', max_length=50, default='')

    class Meta:
        unique_together = [('holder', 'card_number')]


class LoonCapitalFlow(BaseModel):
    """
    结算管理
    """

    creator = models.CharField('创建人', max_length=50)
    gmt_created = models.DateTimeField('创建时间', auto_now_add=True)
    account = models.ForeignKey(LoonAccount, to_field='id', db_constraint=False, on_delete=models.DO_NOTHING, null=True)
    account_balance_amount_before = AmountField(default=0, verbose_name='结算前余额')
    account_balance_amount_after = AmountField(default=0, verbose_name='结算后余额')
    total = AmountField(default=0, verbose_name='结算金额')
    capital_flow_type = models.CharField('流水类型', max_length=50, default='')
    ticket_record = models.ForeignKey(TicketRecord, to_field='id', db_constraint=False, on_delete=models.DO_NOTHING, null=True)

