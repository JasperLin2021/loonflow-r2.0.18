import React, { Component } from "react";
import {Table, Col, Card, Popconfirm, Form, Input, InputNumber, Select, Radio, Button, Modal, Row, message} from "antd";
import {getAccountList, addAccount, delAccountRequest, updateAccount} from "@/services/finance";
import classNames from "classnames";
import "./myless.less";

class AccountList extends Component<any, any> {
  constructor(props) {
    super();
    this.state = {
      accountListResult : [],
      accountListLoading: false,
      accountModalVisible: false,
      accountUserModalVisible: false,
      accountIdForAccountUser: 0,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        onChange: (current) => {
          const pagination = { ...this.state.pagination };
          pagination.current = current;
          this.setState( { pagination }, ()=> {
            this.fetchAccountData({
              page: pagination.current,
              per_page: pagination.pageSize
            })
          });
        }
      }
    }
  }

  componentDidMount() {
    this.fetchAccountData({page:1, per_page:10})
  }

  fetchAccountData = async (params) => {
    this.setState({ accountListLoading: true})
    const result = await getAccountList(params);
    if (result.code === 0 ) {
      const pagination = { ...this.state.pagination };
      pagination.current = result.data.page;
      pagination.pageSize = result.data.per_page;
      pagination.total = result.data.total;

      this.setState({
        accountListLoading: false,
        accountListResult: result.data.value,
        pagination
      })
    }
  }

  searchAccount =(values: object)=>{
    this.fetchAccountData({...values, per_page:10, page:1})
  }

  showEditModal = (record: any) => {
    this.setState({accountDetail: record, accountModalVisible:true, accountDataReadonly: true});
  }

  showAccountUserModal = (accountId: number) => {
    this.setState({accountUserModalVisible: true, accountIdForAccountUser: accountId});
  }
  showAccountModal = (accountId: number) => {
    this.setState({accountModalVisible: true});
  }

  handleAccountOk = () => {
    this.setState({accountModalVisible: false, accountDetail:{}});
  }

  handleAccountCancel = () => {
    this.setState({accountModalVisible: false, accountDetail:{}, accountDataReadonly: false});
  }

  onAccountFinish = async (values) =>{
    console.log(values);
    let result = {};
    if (this.state.accountDetail && this.state.accountDetail.id) {
      result = await updateAccount(this.state.accountDetail.id, values);
    } else {
      result = await addAccount(values);
    }
    if (result.code === 0){
      message.success('保存成功');
      this.setState({accountDetail:{}, accountModalVisible:false, accountDataReadonly: false})
      this.fetchAccountData({});
    } else {
      message.error(`保存失败:${result.msg}`)
    }
  }

  delAccount = async(roldId) => {
    const result = await delAccountRequest(roldId);
    if (result.code === 0 ) {
      message.success('删除角色成功');
      this.fetchAccountData({});
    }
    else{
      message.error(result.msg);
    }

  }

  handleAccountUserOk = () => {
    this.setState({accountUserModalVisible: false})
  }

  handleAccountUserCancel = () => {
    this.setState({accountUserModalVisible: false})
  }


  getAccountDetailField = (fieldName:string) =>{
    if(this.state && this.state.accountDetail){
      return this.state.accountDetail[fieldName]
    }
    return ''
  }

  render() {
    const columns = [
      {
        title: "开户人",
        dataIndex: "holder",
        key: "holder"
      },
      {
        title: "开户行",
        dataIndex: "card_bank",
        key: "card_bank"
      },
      {
        title: "开户账号",
        dataIndex: "card_number",
        key: "card_number"
      },
      {
        title: "初期余额",
        dataIndex: "initial_balance_amount",
        key: "initial_balance_amount"
      },
      {
        title: "余额",
        dataIndex: "balance_amount",
        key: "balance_amount"
      },
      {
        title: "创建人",
        dataIndex: "creator",
        key: "creator",
      },
      {
        title: "创建时间",
        dataIndex: "gmt_created",
        key: "gmt_created"
      },
      {
        title: "修改人",
        dataIndex: "modifier",
        key: "modifier",
      },
      {
        title: "修改时间",
        dataIndex: "gmt_modified",
        key: "gmt_modified"
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "description"
      },
      {
        title: "操作",
        key: "action",
        render: (text: string, record: any) => (
          <span>
            <a style={{marginRight: 16}} onClick={() => this.showEditModal(record)}>编辑</a>
            <a style={{marginRight: 16, color: "red"}}>
              <Popconfirm
                title="确认删除么"
                onConfirm={()=>{this.delAccount(record.id)}}
              >
                删除
              </Popconfirm>
            </a>
            <a style={{marginRight: 16}} onClick={() => this.showEditModal(record)}>充值</a>
            <a style={{marginRight: 16}} onClick={() => this.showEditModal(record)}>转账</a>
          </span>
        )
      },
    ]

    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const tailLayout = {
      wrapperCol: { offset: 8, span: 16 },
    };

    return (
      <div className={classNames("myless")}>
        <Card>
          <Form
            name="advanced_search"
            className="ant-advanced-search-form"
            onFinish={this.searchAccount}
          >
            <Row gutter={24}>
              <Col span={6} key={"search_value"}>
                <Form.Item
                  name={"search_value"}
                  label={"查询"}
                >
                  <Input placeholder="支持开户人、开户账号及描述模糊查询" />
                </Form.Item>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={()=>this.showAccountModal(0)}>
                  新增
                </Button>
              </Col>
            </Row>
          </Form>
          <Table
            loading={this.state.accountListLoading}
            columns={columns}
            dataSource={this.state.accountListResult}
            rowKey={record=>record.id}
            pagination={this.state.pagination}
          />
        </Card>
        <Modal
          title="结算账号"
          visible={this.state.accountModalVisible}
          onOk={this.handleAccountOk}
          onCancel={this.handleAccountCancel}
          width={800}
          footer={null}
          destroyOnClose
        >
          <Form
            {...layout}
            onFinish={this.onAccountFinish}
          >
            <Form.Item name="holder" label="开户人" rules={[{ required: true }]} initialValue={this.getAccountDetailField('holder')}>
              <Input />
            </Form.Item>
            <Form.Item name="card_bank" label="开户行" rules={[{ required: true }]} initialValue={this.getAccountDetailField('card_bank')}>
              <Input />
            </Form.Item>
            <Form.Item name="card_number" label="开户账号" rules={[{ required: true }]} initialValue={this.getAccountDetailField('card_number')}>
              <Input />
            </Form.Item>
            <Form.Item name="initial_balance_amount" label="初期余额" rules={[{ required: true }]} initialValue={this.getAccountDetailField('initial_balance_amount')}>
              <InputNumber disabled={this.state.accountDataReadonly}/>
            </Form.Item>
            <Form.Item name="description" label="描述" rules={[{ required: true }]} initialValue={this.getAccountDetailField('description')}>
              <Input />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Form.Item>

          </Form>
        </Modal>
      </div>



    )
  }


}

export default AccountList;


