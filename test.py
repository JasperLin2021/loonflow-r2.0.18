# 这个模块是用于excel表格操作的，
# 包括插入文件对象的
# 另存xls为xlsx


import os
import win32com.client


class ExcelInsert(object):
    def __init__(self, excel_file_path, sheet_name):
        """
        构造函数
        :param excel_file_path: 指定要操作的excel表格
        :param sheet_name: 指定要操作的excel表格的表
        :returns: None
        """
        self.filename = excel_file_path
        # self.excel = win32com.client.Dispatch('Excel.Application')  # 这个得在gencache.EnsureDispatch('Excel.Application') 有生成对应的缓存文件temp/gen_py/文件夹之后才能使用
        self.excel = win32com.client.gencache.EnsureDispatch('Excel.Application')  # 如果没有缓存文件，则生成缓存文件
        # self.excel.Visible = True  # 显式打开excel 调试设置True
        self.book = self.excel.Workbooks.Open(excel_file_path)
        self.sheet_name = self.book.Worksheets(sheet_name)

    def insert_obj(self, insert_file_path, col, row, auto_wh=False):
        """
        向Excel文件里面插入对象
        :param insert_file_path: 要插入文件的路径,可以插入图片、也可以插入文档等
        :param col: 指定要插入的列
        :param row: 指定要插入的行
        :param auto_wh: 根据对象文件自适应行高
        :returns: None
        """
        shape = self.sheet_name.Shapes.AddOLEObject(Filename=insert_file_path, Link=False)  # 插图片附件
        shape.Left = self.sheet_name.Cells(row, col).Left  # 把定位附件到指定单元格 单位:磅
        shape.Top = self.sheet_name.Cells(row, col).Top
        if auto_wh:
            self.sheet_name.Rows(row).RowHeight = shape.Height  # 行高
            self.sheet_name.Columns(col).ColumnWidth = shape.Width  # 列宽

    def save(self, name=None):
        """
        保存文件，name为自己想要命名文件的名字，不传的话，默认为"源文件名字+（new）"
        :param name: 传入自己要命令的文件名
        :returns: None
        """
        if not name:
            path_list = self.filename.split(".")
            path_list[-2] = path_list[-2] + "(new)"
            path = ".".join(path_list)
        else:
            path = os.path.join(os.getcwd(), name)
        if os.path.exists(path):
            os.remove(path)
        self.book.SaveAs(path)
        self.book.Close()
        self.excel.Application.Quit()

    def __del__(self):
        pass


if __name__ == '__main__':
    a = ["A", "B", "C", "D", "E"]
    path = os.getcwd()
    filename = "../temp/test.xlsx"
    filename = os.path.join(path, filename)
    img_name = os.path.join(path, "../temp/baiyu_logo.jpg")
    # img_name = os.path.join(path, "../temp/Aword.docx")

    excel = ExcelInsert(filename, "Sheet1")
    for col in a:
        excel.insert_obj(img_name, col, 20)
    excel.save()  # 调用保存方法