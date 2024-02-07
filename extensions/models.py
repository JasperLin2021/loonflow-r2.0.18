from django.db.models import DecimalField


class AmountField(DecimalField):
    """金额字段"""

    def __init__(self, verbose_name=None, name=None, **kwargs):
        kwargs['max_digits'], kwargs['decimal_places'] = 16, 2
        super().__init__(verbose_name, name, **kwargs)

__all__ = [
 'AmountField'
]