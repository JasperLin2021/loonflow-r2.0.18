import React, { Component } from "react";
import {Table, Col, Card, DatePicker, Form, Input, InputNumber, Select, Radio, Button, Modal, Row, message} from "antd";
import {getCapitalFlowList, capitalFlowDetailExecl, getCapitalFlowListType} from "@/services/finance";
import {getDetailDetailRequest} from "@/services/ticket";
import moment from 'moment';
import BraftEditor from 'braft-editor';
import "braft-editor/dist/index.css";
import { exportExcel } from '@/utils/excel'

const { RangePicker } = DatePicker;

class CapitalFlowList extends Component<any, any> {
  constructor(props: any) {
    super();
    this.state = {
      searchValue: {},
      capitalFlowTypeResult: [{"id":1, "name":"收入"},{"id":2, "name":"支出"}],
      fileList: {},
      ticketId: 0,
      ticketDetailInfoData: [],
      capitalflowListResult : [],
      capitalflowListLoading: false,
      capitalflowModalVisible: false,
      capitalflowUserModalVisible: false,
      capitalflowIdForCapitalFlowUser: 0,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        onChange: (current: any) => {
          const pagination = { ...this.state.pagination };
          pagination.current = current;
          this.setState( { pagination }, ()=> {
            this.fetchCapitalFlowData({
              page: pagination.current,
              per_page: pagination.pageSize
            })
          });
        }
      }
    }
  }

  componentDidMount() {
    this.fetchCapitalFlowData({page:1, per_page:10})
  }

  fetchCapitalFlowData = async (params: getCapitalFlowListType) => {
    this.setState({ capitalflowListLoading: true})
    // //console.log("params",params)
    const result = await getCapitalFlowList(params);
    if (result.code === 0 ) {
      const pagination = { ...this.state.pagination };
      pagination.current = result.data.page;
      pagination.pageSize = result.data.per_page;
      pagination.total = result.data.total;

      this.setState({
        capitalflowListLoading: false,
        capitalflowListResult: result.data.value,
        pagination
      })

      // //console.log("capitalflowListResult", result.data.value)
    }else {
      message.error(result.msg);
      this.setState({capitalflowListLoading: false});
    }
  }

  searchCapitalFlow =()=>{
    let searchValue = this.state.searchValue
    // //console.log("searchValue",searchValue)
    this.fetchCapitalFlowData(searchValue)
  }

  showTicketRecordModal = (record: any) => {
    // //console.log("record.ticket_record_id",record)
    this.setState({ticketRecordModalVisible:true, ticketId: record});
    this.fetchTicketDetailInfo(record);
  }

  showCapitalFlowUserModal = (capitalflowId: number) => {
    this.setState({capitalflowUserModalVisible: true, capitalflowIdForCapitalFlowUser: capitalflowId});
  }
  showCapitalFlowModal = (capitalflowId: number) => {
    this.setState({capitalflowModalVisible: true});
  }

  handleCapitalFlowOk = () => {
    this.setState({capitalflowModalVisible: false, capitalflowDetail:{}});
  }

  handleTicketRecordCancel = () => {
    this.setState({ticketRecordModalVisible: false, capitalflowDetail:{}});
  }

  handleCapitalFlowUserOk = () => {
    this.setState({capitalflowUserModalVisible: false})
  }

  handleCapitalFlowUserCancel = () => {
    this.setState({capitalflowUserModalVisible: false})
  }


  getCapitalFlowDetailField = (fieldName:string) =>{
    if(this.state && this.state.capitalflowDetail){
      return this.state.capitalflowDetail[fieldName]
    }
    return ''
  }

  fetchTicketDetailInfo = async(record: any) => {
    // //console.log("this.state.ticket_id",this.state.ticket_id)

    const result = await getDetailDetailRequest({ticket_id: record});
    // //console.log("result",result)

    if (result.code === 0 ){
      this.setState({
        ticketDetailInfoData: result.data.value.field_list
      })
    // let formInitValues = {};
    // let fieldTypeDict = {}
    // if (result.data.value.field_list !== []){
    //   result.data.value.field_list.map(result => {
    //     fieldTypeDict[result.field_key] = result.field_type_id
    //     if (result.field_type_id === 30 && result.field_value !== null){
    //       formInitValues[result.field_key] = moment(result.field_value);
    //     } else if (result.field_type_id === 25 && result.field_value !== null){
    //       formInitValues[result.field_key] = moment(result.field_value);
    //     }
    //     else if ([40, 50, 70].indexOf(result.field_type_id) >= 0) {
    //       formInitValues[result.field_key] = result.field_value? result.field_value.split(','): []
    //       //console.log(formInitValues);
    //     }

    //     else if (result.field_type_id === 80){
    //       // 附件
    //       let newList = this.state.fileList;
    //       let fileList1 = [];
    //       if(result.field_value && result.field_value.startsWith('[')) {
    //         //为了兼容旧格式，所以这么写
    //         const urlInfo = JSON.parse(result.field_value)
    //         urlInfo.forEach((elem, index) => {
    //           fileList1.push(
    //             {
    //               url: elem.url,
    //               name: elem.file_name,
    //               uid: elem.url,
    //               linkProps: `{"download": "${elem.file_name}"}`
    //             }
    //           )
    //         })
    //       }
    //       else{
    //         let fileList0 = result.field_value? result.field_value.split(): [];
    //         fileList0.forEach((file0)=>{
    //           fileList1.push(
    //             {
    //               url: file0,
    //               name: file0.split('/').slice(-1)[0],
    //               uid: file0,
    //             }
    //           )

    //         })
    //       }

    //       // newList[result.field_key] = result.field_value.split();
    //       newList[result.field_key] = fileList1
    //       //console.log('newList')
    //       //console.log(newList)
    //       // this.setState({ fileList: newList });
    //       formInitValues[result.field_key] = {fileList: fileList1};

    //     }
    //     else{
    //       formInitValues[result.field_key] = result.field_value;
    //     }
    //   })
    // }
    // this.setState({fieldTypeDict});
    // //console.log("fieldTypeDict",fieldTypeDict)
    // //console.log("formInitValues",formInitValues)

    // this.formRef.current.setFieldsValue(formInitValues);

    }else {
    message.error(result.msg)
    }
}

  formRef = React.createRef<FormInstance>();

  switchFormItem =  (item: any) => {
    let child = null;
    const formItemOptions = {rules: [], extra: item.description};
    const formItemChildOptions = {disabled: false, placeholder:item.placeholder};

    if (item.field_attribute === 1) {
      // todo: 下拉列表、布尔radio等显示的处理
      if (item.field_type_id === 20) {
        // 布尔
        let display_result = item.boolean_field_display[item.field_value]
        child = <div>{display_result}</div>
      }

      else if (item.field_type_id === 35) {
        // 单选框
        let display_result = item.field_choice[item.field_value]
        child = <div>{display_result}</div>
      }else if (item.field_type_id === 40) {
        //多选框
        let result_list = item.field_value?item.field_value.split(','):[]
        let result_display_list: any[] = []
        result_list.forEach((result0: string | number)=>{
          //console.log(result0)
          if(item.field_choice[result0]){
            result_display_list.push(item.field_choice[result0])
          }
        })

        let display_result = result_display_list.join()
        child = <div>{display_result}</div>
      } else if (item.field_type_id === 45) {
        //下拉列表
        let display_result = item.field_choice[item.field_value]
        child = <div>{display_result}</div>
      } else if (item.field_type_id === 50) {
        //多选下拉列表
        let result_list = item.field_value?item.field_value.split(','):[]
        let result_display_list: any[] = []
        result_list.forEach((result0: string | number)=>{
          //console.log(result0)
          if(item.field_choice[result0]){
            result_display_list.push(item.field_choice[result0])
          }
        })

        let display_result = result_display_list.join()
        child = <div>{display_result}</div>
      }else if (item.field_type_id === 60) {
        //用户名
        child = <div>{item.field_value}</div>
      }else if (item.field_type_id === 70) {
        //多选用户
        child = <div>{item.field_value}</div>
      }
      else if (item.field_type_id === 58) {
        //富文本
        child = <div dangerouslySetInnerHTML={{__html: item.field_value }}/>
      }


      else if (item.field_type_id === 80){

        if (!item.field_value){
          child = <div></div>
        } else {
          child = []
        if(item.field_value.startsWith('[')){
          //为了兼容旧格式，所以这么写
          const urlInfo = JSON.parse(item.field_value)
          urlInfo.forEach((elem: { url: string | undefined; file_name: string | number | boolean | {} | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactNodeArray | React.ReactPortal | null | undefined; }, index: any)=>{
            child.push(<a href={elem.url}>{elem.file_name}<br/></a>)
          })
        } else {
          const url_list = item.field_value.split()
          url_list.forEach((url0: string | undefined)=>{

            child.push(<a href={url0}>{url0.split('/').slice(-1)[0]}</a>)
          })
        }
        }

      }
      else{
        child = <div>{item.field_value}</div>

      }
    }  else {
      if (item.field_attribute === 2 ) {
        if (item.field_type_id === 80){
          formItemOptions.rules = [{ required: true, message: `Please upload ${item.field_key}` },
        () => ({
          validator(rule: any, value: { fileList: string | any[]; }) {
            if (value.fileList.length === 0){
              return Promise.reject('please upload file');
            }
          return Promise.resolve();
         },
      })
        ]}

        else {
          formItemOptions.rules = [{ required: true, message: `Please input ${item.field_key}` }]
        }
      }

      if (item.field_type_id === 5) {
        // 字符串
        child = <Input {...formItemChildOptions}/>

      } else if (item.field_type_id === 10){
        // 整形
        child = <InputNumber precision={0} {...formItemChildOptions}/>
      } else if (item.field_type_id === 15){
        // 浮点型
        child = <InputNumber {...formItemChildOptions}/>
      } else if (item.field_type_id === 20){
        // 布尔
        const radioOption = []
        for (var key in item.boolean_field_display) {
          radioOption.push(<Radio key={key} value={key}>{item.boolean_field_display[key]}</Radio>)
        }
        child = <Radio.Group
          {...formItemChildOptions}
        >
          {radioOption}
        </Radio.Group>
      } else if (item.field_type_id == 25){
        // 日期类型
        child = <DatePicker {...formItemChildOptions}/>
      } else if (item.field_type_id == 30){
        // 日期时间类型
        child = <DatePicker {...formItemChildOptions} showTime/>
      } else if (item.field_type_id == 35){
        // 单选
        const radioOption = []
        for (var key in item.field_choice) {
          radioOption.push(<Radio key={key} value={key}>{item.field_choice[key]}</Radio>)
        }
        child = <Radio.Group
          {...formItemChildOptions}
        >
          {radioOption}
        </Radio.Group>
      } else if (item.field_type_id == 40){
        // 多选checkbox
        const checkboxOption = []
        for (var key in item.field_choice) {
          checkboxOption.push(
            <Checkbox key={key} value={key}>{item.field_choice[key]}</Checkbox>
          )
        }
        child = <Checkbox.Group style={{ width: '100%' }}
        >{checkboxOption}</Checkbox.Group>
      } else if (item.field_type_id == 45){
        // 下拉列表
        const selectOption = []
        for (var key in item.field_choice) {
          selectOption.push(
            <Option key={key} value={key}>{item.field_choice[key]}</Option>
          )
        }
        child = <Select showSearch filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } {...formItemChildOptions}
        >
          {selectOption}
        </Select>

      } else if (item.field_type_id == 50){
        // 下拉列表
        const selectOption = []
        for (var key in item.field_choice) {
          selectOption.push(
            <Option key={key} value={key}>{item.field_choice[key]}</Option>
          )
        }
        child = <Select showSearch mode="multiple" filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } {...formItemChildOptions}
        >
          {selectOption}
        </Select>

      } else if (item.field_type_id === 55){
        // 文本
        child = <TextArea autoSize={{ minRows: 2, maxRows: 6 }} {...formItemChildOptions}/>
        // child = <TextArea autoSize={{ minRows: 2, maxRows: 6 }} {...formItemChildOptions} defaultValue={item.field_value}/>
      } else if (item.field_type_id === 58){
        // 富文本，先以文本域代替，后续再支持
        // child = <TextArea autoSize={{ minRows: 2, maxRows: 6 }} {...formItemChildOptions}/>
        child = <BraftEditor
          media={{uploadFn: myUploadFn}}
        />

      }
      else if (item.field_type_id === 80){
        // 附件import BraftEditor from 'braft-editor'
        child = <Upload action="api/v1.0/tickets/upload_file" listType="text" onChange={(info: any)=>this.fileChange(item.field_key, info)} fileList={this.state.fileList[item.field_key]}>
        {/*child = <Upload action="api/v1.0/tickets/upload_file" listType="text" onChange={(info)=>this.fileChange(item.field_key, info)}>*/}
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      }

      else if (item.field_type_id === 60){
        // 用户
        child = <Select
          showSearch onSearch = {(search_value)=>this.userSimpleSearch(item.field_key, search_value)} filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } {...formItemChildOptions}
        >
          {this.state.userSelectDict[item.field_key] && this.state.userSelectDict[item.field_key].map((d: { username: any; alias: any; }) => (
            <Option key={d.username} value={d.username}>{`${d.alias}(${d.username})`}</Option>
          ))}

        </Select>
      }


      else if (item.field_type_id === 70){
        // 多选用户
        child = <Select
          mode="multiple"
          showSearch onSearch = {(search_value)=>this.userSimpleSearch(item.field_key, search_value)} filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } {...formItemChildOptions}
         >
          {this.state.userSelectDict[item.field_key] && this.state.userSelectDict[item.field_key].map((d: { username: any; alias: any; }) => (
            <Option key={d.username} value={d.username}>{`${d.alias}(${d.username})`}</Option>
          ))}

        </Select>
      }


      else {
        child = <Input {...formItemChildOptions}/>
      }
    }



    return (
      <Col span={12}>
        <Form.Item
          name={item.field_key}
          label={item.field_name}
          {...formItemOptions}
        >
          {child}
        </Form.Item>
      </Col>

    )
  }

  exportExcel  = async() => {
    let searchValue = this.state.searchValue

    const result = await capitalFlowDetailExecl(searchValue);
    // //console.log("result",result)

    // if (result.code === 0 ){
      exportExcel(result, '资金流水统计表');
    // }
    // else {
    //     message.error(result.msg)
    //     }
  }

  onValuesChange = (changedValues: any, values: { create_time: { format: (arg0: string) => any; }[]; create_start: any; create_end: any; }) => {
    if (values.create_time){
      if (values.create_time[0]){
        values.create_start = values.create_time[0].format('YYYY-MM-DD HH:mm:ss')
      }
      if (values.create_time[1]){
        values.create_end = values.create_time[1].format('YYYY-MM-DD HH:mm:ss')
      }
      delete(values.create_time)

    }

    this.setState({searchValue: values})

    };

  render() {
    const form_items: {} | null | undefined = [];
    if (this.state.ticketDetailInfoData !== []){
      this.state.ticketDetailInfoData.map((result: any) => {
        let formItem = this.switchFormItem(result);
        if (formItem.props.children.props.label !== "当前处理人") {
          form_items.push(formItem);
        }
      })
      // //console.log("form_items",form_items)
    }

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };


    const columns = [
      {
        title: "结算银行",
        dataIndex: "card_bank",
        key: "card_bank"
      },
      {
        title: "结算卡号",
        dataIndex: "card_number",
        key: "card_number"
      },
      {
        title: "结算前余额",
        dataIndex: "account_balance_amount_before",
        key: "account_balance_amount_before"
      },
      {
        title: "结算金额",
        dataIndex: "total",
        key: "total"
      },
      {
        title: "结算后余额",
        dataIndex: "account_balance_amount_after",
        key: "account_balance_amount_after"
      },
      {
        title: "流水类型",
        dataIndex: "capital_flow_type",
        key: "capital_flow_type",
      },
      {
        title: "创建人",
        dataIndex: "creator",
        key: "creator"
      },
      {
        title: "创建时间",
        dataIndex: "gmt_created",
        key: "gmt_created"
      },
      {
        title: "操作",
        key: "action",
        render: (text: string, record: any) => (
          <span>
            <a style={{marginRight: 16}} onClick={() => this.showTicketRecordModal(record.ticket_record_id)}>详情</a>
          </span>
        )
      },
    ]

    const getFields = () => {
      const children = [
        <Col span={6} key={"card_bank"}>
          <Form.Item
            name={"card_bank"}
            label={"结算银行"}
          >
            <Input placeholder="支持结算银行模糊查询" />
          </Form.Item>
        </Col>,

        <Col span={6} key={"card_number"}>
        <Form.Item
          name={"card_number"}
          label={"结算卡号"}
        >
          <Input placeholder="支持结算卡号模糊查询" />
        </Form.Item>
        </Col>,

        <Col span={6} key={"capital_flow_type"}>
          <Form.Item
            name={"capital_flow_type"}
            label={"流水类型"}
          >
            <Select
              showSearch
              allowClear
              // labelInValue
              style={{ width: 300}}
              placeholder="选择流水类型"
              optionFilterProp="children"
              filterOption={(input, option) =>
                Select.Option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {this.state.capitalFlowTypeResult.map((d: { id: React.Key | null | undefined; name: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }) => (
                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>,

        <Col span={6} key={"create_time"}>
          <Form.Item
            name={"create_time"}
            label={"创建时间"}
          >
            <RangePicker
              showTime={{
                hideDisabledOptions: true,
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss "
            />
          </Form.Item>
        </Col>


      ]
      return children;
    };

    return (
      <div>
        <Card>
          <Form
            name="advanced_search"
            className="ant-advanced-search-form"
            ref={this.formRef}
            onFinish={this.searchCapitalFlow}
            onValuesChange={this.onValuesChange}
          >
            <Row gutter={24}>
            {getFields()}
            </Row>
            <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button
                style={{ margin: '0 8px' }}
                onClick={() => {
                  this.formRef.current.resetFields();
                  this.setState({searchValue: ""})
                }}
              >
                重置
              </Button>
              <Button
                style={{ margin: '0 8px' }}
                onClick={this.exportExcel}
              >
                导出
              </Button>
            </Col>
          </Row>
          </Form>
          <Table
            loading={this.state.capitalflowListLoading}
            columns={columns}
            dataSource={this.state.capitalflowListResult}
            rowKey={record=>record.id}
            pagination={this.state.pagination}
          />
        </Card>

        <Modal
          title={`工单详情: #${this.state.ticketId}`}
          visible={this.state.ticketRecordModalVisible}
          onOk={this.handleCapitalFlowOk}
          onCancel={this.handleTicketRecordCancel}
          width={800}
          footer={null}
          destroyOnClose
        >
           <Form
              {...formItemLayout}
              name="ticketDetailForm"
              // ref={this.formRef}
              className="ant-advanced-search-form"
            >
              <Row gutter={24}>
                {form_items}
              </Row>
            </Form>
        </Modal>
      </div>



    )
  }


}

export default CapitalFlowList;


