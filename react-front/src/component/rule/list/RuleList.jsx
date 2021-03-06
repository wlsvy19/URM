import React from 'react'
import { message, Modal } from 'antd'
import * as urmsc from '../../../urm-utils'

const LIST_STATE = urmsc.LIST_STATE
const locale = urmsc.locale

class RuleSearch extends React.Component {
  componentDidMount() {
    this.props.form.setFieldsValue(this.props.scparam)
    this.props.search(this.props.form.getFieldsValue())
    
    let $el = this.props.path === 'request' ?
      document.querySelectorAll('.advanced-search-bar input.ant-input') :
      document.querySelectorAll('.search-bar input.ant-input')
    let $this = this
    $el.forEach((it) => {
      it.addEventListener('keydown', function(e) {
        if (e && e.keyCode === 13) {
          $this.props.search($this.props.form.getFieldsValue())
        }
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.props.scparam) !== JSON.stringify(prevProps.scparam)) {
      this.props.form.setFieldsValue(this.props.scparam)
    }
  }

  method = {
    clickSearch: e => {
      this.props.search(this.props.form.getFieldsValue())
    },
    
    clickAdd: e => {
      this.props.edit()
    },
    
    clickDelete: e => {
      this.props.delete('selected')
    },
    
    renderButton: (render) => {
      return !this.props.onlySearch && render
    },
  }
}

class RuleList extends React.Component {
  state = {
    items: [],
    selectedKeys: [],
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.items !== nextState.items) {
      return true
    }
    if (this.props.codeList && this.props.codeList.length !== nextProps.codeList.length) {
      return true
    }
    if (JSON.stringify(this.props.scparam) !== JSON.stringify(nextProps.scparam)) {
      return true
    }
    return false
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.props.scparam) !== JSON.stringify(prevProps.scparam)) {
      this.method.search(this.props.scparam)
    }
  }

  method = {
    getTypeStr: (key, val) => {
      let kind = urmsc.CODEKEY[key]
      let list = this.props.codeList
      let obj = {}
      
      for(let i=0; i < list.length; i++) {
        let it = list[i]
        if (it.kind === kind && it.code === val) {
          obj = it
          break
        }
      }
      return obj.name
    },

    clickEdit: (id) => {
      this.props.edit(id)
    },

    clickDelete: (ids) => {
      if (ids === 'selected') {
        ids = this.state.selectedKeys
      }
      if (!ids || ids.length === 0) {
        message.warning(locale['message.1004'])
        return false
      }
      let $this = this
      Modal.confirm({
        autoFocusButton: 'cancel',
        content: '정말 삭제 하시겠습니까?',
        cancelText: 'NO',
        okText: 'YES',
        onOk() {
          urmsc.ajax({
            type: 'POST',
            url: 'api/' + $this.props.path + '/delete',
            data: JSON.stringify(ids),
            contentType: 'application/json; charset=UTF-8',
            success: function(res) {
              console.log('delete ' + res + ' ' + $this.props.path.toUpperCase())
              $this.method._updateItems(LIST_STATE.DELETE, ids)
            },
          })
        }
      })
    },

    search: (param) => {
      let $this = this
      urmsc.ajax({
        type: 'GET',
        url: 'api/' + this.props.path,
        data: param,
        success: function(list) {
          $this.setState({items: list})
        },
      })
    },

    renderButton: (render) => {
      return !this.props.onlySearch && render
    },
    
    _updateItems: (type, data) => {
      let tmp = [...this.state.items]
      
      if (type === LIST_STATE.DELETE) {
        for (let i = tmp.length-1; i >= 0; i--) {
          let it = tmp[i]
          if (data.indexOf(it.id) > -1) {
            tmp.splice(i, 1)
          }
        }
      } else if (type === LIST_STATE.UPDATE) {
        let update = false
        for (let i = 0; i < tmp.length; i++) {
          if (tmp[i].id === data.id) {
            tmp[i] = data
            update = true
            break
          }
        }
        if (!update) tmp.unshift(data)
      }
      
      this.setState({items: tmp})
    },

    isPageDelete: () => {
      let auth = this.props.userInfo ? this.props.userInfo.auth : ''
      return urmsc.isPageEdit(this.props.path, 'delete', auth)
    }
  }
  
  rowSelection = {
    columnWidth: 40,
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      let tmp = []
      selectedRows.forEach((it) => {
        tmp.push(it.id)
      })
      this.setState({selectedKeys: tmp})
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      let tmp = []
      selectedRows.forEach((it) => {
        tmp.push(it.id)
      })
      this.setState({selectedKeys: tmp})
    },
  }

  onRow = (record, index) => {
    return {
      onDoubleClick: e => { if (this.props.onDbClick) this.props.onDbClick(record) }
     }
  }
}

RuleList.defaultProps = {
  onlySearch: false
}

export default RuleList
export {RuleSearch}