<template>
  <div class="custom-select">
    <!-- 主选择框 -->
    <div class="select-container">
      <el-select
        ref="selectRef"
        v-model="selectedValues"
        :multiple="multiple"
        :placeholder="placeholder"
        :collapse-tags="true"
        :collapse-tags-tooltip="true"
        filterable
        :remote="true"
        :remote-method="remoteSearch"
        :remote-show-suffix="true"
        @visible-change="handleVisibleChange"
        @change="handleChange"
        :suffix-icon="suffixIcon"
        :clearable="true"
        v-bind="$attrs"
        popper-class="custom-select-popper"
      >
        <!-- 添加全选选项 -->
        <el-option
          v-if="multiple && allSelectModule"
          :key="allSelectModule.value"
          :label="allSelectModule.key"
          :value="allSelectModule.value"
        >
          <div class="option-item">
            <span>{{ allSelectModule.key }}</span>
          </div>
        </el-option>

        <!-- 下拉框顶部操作按钮 -->
        <template #header v-if="multiple">
          <div class="select-operations">
            <el-button v-if="isLocal || !hasMore" type="text" @click.stop="handleSelectAll">全选</el-button>
            <el-button v-if="isLocal || !hasMore" type="text" @click.stop="handleInvertSelect">反选</el-button>
            <el-button type="text" @click.stop="handleClearAll">清空</el-button>
          </div>
        </template>

        <!-- 选项列表 -->
        <el-option
          v-for="item in displayOptions"
          :key="item[valueKey]"
          :label="item[labelKey]"
          :value="item[valueKey]"
          :disabled="selectedValues.includes(allSelectModule?.value)"
        >
          <div class="option-item">
            <span>{{ item[labelKey] }}</span>
          </div>
        </el-option>

        <!-- 添加底部加载状态 -->
        <div v-if="!isLocal" class="loading-more">
          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="!hasMore && internalOptions.length > 0">
            没有更多数据了
          </div>
        </div>
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, h, onUnmounted, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { test } from '@/service/api'
import { Loading, ArrowDown, Refresh } from '@element-plus/icons-vue'

// 组件属性定义
const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: ''
  },
  params: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Array,
    default: () => []
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  pageSize: {
    type: Number,
    default: 10
  },
  allSelectModule: {
    type: Object,
    default: () => ({})
  }
})

// 事件
const emit = defineEmits(['update:modelValue', 'change', 'search'])

// 响应式状态
const loading = ref(false)
const internalOptions = ref([])
const selectedValues = ref(props.multiple ? [] : '')
const page = ref(1)
const keyword = ref('')
const hasMore = ref(true)
const filteredLocalOptions = ref([])
const remoteCache = ref({})

// 判断是否使用本地选项
const isLocal = computed(() => {
  return Array.isArray(props.options) && props.options.length > 0
})

// 显示的选项（本地或远程）
const displayOptions = computed(() => {
  if (isLocal.value) {
    return filteredLocalOptions.value
  }
  return internalOptions.value
})

const suffixIcon = computed(() => {
  if (loading.value) return Loading
  if (props.url) {
    // 返回可点击的刷新icon
    return {
      render() {
        return h('span', {
          style: 'cursor:pointer;display:inline-flex;',
          onClick: handleRefresh,
          title: '刷新'
        }, [h(Refresh)])
      }
    }
  }
  return ArrowDown
})

const selectRef = ref(null)
const handleRefresh = (e) => {
  e.stopPropagation()
  // 清空缓存并重新加载第一页
  remoteCache.value[keyword.value] = undefined
  page.value = 1
  hasMore.value = true
  internalOptions.value = []
  fetchOptions(true)
  // nextTick(() => {
  //   selectRef.value && selectRef.value.toggle()
  // })
}

// 初始化 selectedValues
watch(() => props.modelValue, (newVal) => {
  if (props.multiple) {
    selectedValues.value = Array.isArray(newVal) ? [...newVal] : []
  } else {
    selectedValues.value = newVal
  }
}, { immediate: true })

// 监听本地 options 变化
watch(() => props.options, (newOptions) => {
  if (isLocal.value) {
    // 如果有关键词，过滤本地选项
    filterLocalOptions()
  }
}, { deep: true })

// 过滤本地选项
const filterLocalOptions = () => {
  if (!keyword.value) {
    filteredLocalOptions.value = [...props.options]
    return
  }
  
  filteredLocalOptions.value = props.options.filter(item => {
    const label = item[props.labelKey]
    return label && String(label).toLowerCase().includes(keyword.value.toLowerCase())
  })
}

// 计算已选项
const selectedOptions = computed(() => {
  if (!props.multiple || !Array.isArray(selectedValues.value)) return []
  
  // 从当前选项中查找选中项
  const allOptions = isLocal.value ? props.options : internalOptions.value
  const currentOptionsMap = new Map(allOptions.map(item => [item[props.valueKey], item]))
  
  return selectedValues.value.map(value => {
    const foundOption = currentOptionsMap.get(value)
    if (foundOption) {
      return foundOption
    }
    // 如果在当前选项中找不到，创建一个临时对象
    return { [props.valueKey]: value, [props.labelKey]: `${value}` }
  })
})

// 获取远程选项数据
const fetchOptions = async (isSearch = false) => {
  if (isLocal.value || !props.url) return
  if (!hasMore.value || loading.value) return

  loading.value = true
  try {
    const requestParams = {
      currentPage: page.value,
      pageSize: props.pageSize,
      enabled: true,
      queryModel: 1,
      ...props.params
    }
    if (keyword.value) requestParams[props.labelKey] = keyword.value
    Object.keys(requestParams).forEach(key => {
      if (requestParams[key] === null || requestParams[key] === undefined || requestParams[key] === '') {
        delete requestParams[key]
      }
    })

    const { data } = await test(props.url, requestParams) || {}
    const newList = data.result || []

    if (page.value === 1 || isSearch || keyword.value) {
      internalOptions.value = newList
    } else {
      // 追加新数据并去重
      const existingKeys = new Set(internalOptions.value.map(item => item[props.valueKey]))
      const uniqueNewItems = newList.filter(item => !existingKeys.has(item[props.valueKey]))
      internalOptions.value = internalOptions.value.concat(uniqueNewItems)
    }
    hasMore.value = newList.length === props.pageSize

    // 缓存本次数据
    remoteCache.value[keyword.value] = {
      options: [...internalOptions.value],
      page: page.value,
      hasMore: hasMore.value
    }
  } catch (error) {
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 处理滚动加载（仅远程模式需要）
const handleScroll = (e) => {
  if (isLocal.value) return
  
  const { scrollTop, clientHeight, scrollHeight } = e.target
  // 接近底部时加载更多，增加缓冲区避免频繁触发
  if (scrollHeight - scrollTop - clientHeight < 50 && hasMore.value && !loading.value) {
    page.value++
    fetchOptions()
  }
}

// 防抖处理的搜索
const debouncedFetchOptions = debounce(() => fetchOptions(true), 300)

// 远程搜索或本地过滤
const remoteSearch = (query) => {
  keyword.value = query
  if (isLocal.value) {
    // 本地过滤
    filterLocalOptions()
  } else {
    // 远程模式下，优先用缓存
    if (remoteCache.value[query]) {
      internalOptions.value = remoteCache.value[query].options
      page.value = remoteCache.value[query].page
      hasMore.value = remoteCache.value[query].hasMore
      return
    }
    // 没有缓存才请求
    page.value = 1
    hasMore.value = true
    debouncedFetchOptions()
  }
}

// 处理下拉框显示状态变化
const handleVisibleChange = (visible) => {
  if (visible) {
    if (isLocal.value) {
      // 本地选项模式，初始化过滤
      filterLocalOptions()
    } else {
      // 首次打开且无缓存才加载
      if (!internalOptions.value.length) {
        remoteSearch(keyword.value)
      }
      // 添加滚动事件监听（仅远程模式需要）
      setTimeout(() => {
        const dropdown = document.querySelector('.custom-select-popper .el-select-dropdown__wrap')
        if (dropdown) {
          dropdown.scrollTop = 0 // 重置滚动位置
          dropdown.addEventListener('scroll', handleScroll)
        }
      }, 0)
    }
  } else {
    // 关闭时移除滚动事件监听
    if (!isLocal.value) {
      const dropdown = document.querySelector('.custom-select-popper .el-select-dropdown__wrap')
      if (dropdown) {
        dropdown.removeEventListener('scroll', handleScroll)
      }
      // 不清空 internalOptions 和 remoteCache
    }
  }
}

// 全选
const handleSelectAll = () => {
  if (!props.multiple) return
  
  // 如果已经选中了"全部"，则取消全选
  if (selectedValues.value.includes(props.allSelectModule.value)) {
    selectedValues.value = []
  } else {
    // 选中"全部"选项
    selectedValues.value = [props.allSelectModule.value]
  }
}

// 处理选择变化
const handleChange = (val) => {
  if (props.multiple && props.allSelectModule) {
    // 如果选中了"全部"
    if (val.includes(props.allSelectModule.value)) {
      // 只保留"全部"选项
      selectedValues.value = [props.allSelectModule.value]
    } else {
      // 如果选中了其他选项，则移除"全部"选项
      selectedValues.value = val.filter(v => v !== props.allSelectModule.value)
    }
  } else {
    selectedValues.value = val
  }
  
  emit('update:modelValue', selectedValues.value)
  emit('change', selectedValues.value, selectedOptions.value)
}

// 反选
const handleInvertSelect = () => {
  if (!props.multiple) return
  
  // 如果当前选中了"全部"，则清空选择
  if (selectedValues.value.includes(props.allSelectModule.value)) {
    selectedValues.value = []
  } else {
    // 如果当前没有选中"全部"，则选中"全部"
    selectedValues.value = [props.allSelectModule.value]
  }
}

// 清空
const handleClearAll = () => {
  selectedValues.value = []
}

// 监听选中值变化
watch(selectedValues, (newVal) => {
  // emit('update:modelValue', newVal)
  emit('change', newVal, selectedOptions.value)
}, { deep: true })

// 处理远程数据的回显
const handleRemoteInitialValues = async () => {
  if (isLocal.value || !props.url || !selectedValues.value.length) return
  
  // 如果已经有数据，检查是否需要补充缺失的选中项
  const existingKeys = new Set(internalOptions.value.map(item => item[props.valueKey]))
  const missingValues = selectedValues.value.filter(value => !existingKeys.has(value))
  
  if (missingValues.length > 0) {
    loading.value = true
    try {
      const requestParams = {
        currentPage: 1,
        pageSize: missingValues.length,
        enabled: true,
        queryModel: 1,
        [`${props.valueKey}List`]: Array.isArray(missingValues) ? missingValues.join(',') : missingValues,
        ...props.params
      }
      
      const { data } = await test(props.url, requestParams) || {}
      const newList = data.result || []
      
      // 将新获取的数据添加到现有选项中
      internalOptions.value = [...internalOptions.value, ...newList]
    } catch (error) {
      console.error('Failed to fetch initial values:', error)
    } finally {
      loading.value = false
    }
  }
}

// 在组件挂载时处理回显
onMounted(() => {
  handleRemoteInitialValues()
})

onUnmounted(() => {
  // 清除缓存数据
  remoteCache.value = {}
})
</script>
<style lang="scss">
.el-input {
  --el-input-inner-height: calc(var(--el-input-height, 32px));
 }
  .loading-state, .empty-state {
    padding: 5px 0;
    text-align: center;
    color: #909399;
    font-size: 14px;
  }

  .loading-more {
    padding: 5px 0;
    text-align: center;
    color: #909399;
    font-size: 12px;
    // border-top: 1px solid #f0f0f0;

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;

      .el-icon {
        font-size: 14px;
      }
    }

    .empty-state {
      color: #999;
    }
  }
</style>
<style lang="scss" scoped>
.custom-select {
  display: flex;
  gap: 10px;
  width: 100%;
  
  .select-container {
    display: flex;
    align-items: center;
    flex: 1;
    
    .el-select {
      :deep(.el-input__wrapper) {
        background-color: #fff;
        border-radius: 4px;
        
        .el-input__inner {
          height: 32px;
          line-height: 32px;
        }
        
        .clear-icon {
          color: #c0c4cc;
          font-size: 16px;
          cursor: pointer;
          
          &:hover {
            color: #909399;
          }
        }
      }
    }
    
    .search-btn {
      margin-left: 10px;
      height: 32px;
      padding: 0 15px;
      background-color: #f56c6c;
      border-color: #f56c6c;
      
      &:hover, &:focus {
        background-color: #f78989;
        border-color: #f78989;
      }
    }
  }
  
  .selected-items-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    
    .selected-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: #fff;
      border-radius: 4px;
      color: #f56c6c;
      
      .selected-label {
        font-size: 14px;
      }
      
      .selected-check {
        color: #f56c6c;
        font-size: 16px;
      }
    }
  }
}

</style>