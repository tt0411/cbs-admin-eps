<template>
  <el-form class="search-form" :model="form" :inline="true" :label-width="labelWidth" ref="searchFormRef">
    <div class="visible-conditions">
      <slot name="visibleConditions" :scope="form"></slot>
      <div class="button-group">
        <el-dropdown v-if="$slots.hiddenConditions && !$slots.moreConditions" trigger="click"
          @visible-change="handleVisibleChange" :hide-on-click="false">
          <template #dropdown>
            <el-dropdown-menu>
              <div class="hide-position">
                <slot name="hiddenConditions" :scope="form"></slot>
              </div>
            </el-dropdown-menu>
          </template>
          <el-button-group>
            <el-button>
              <el-icon class="mr-5px">
                <ArrowUp v-if="visible" />
                <ArrowDown v-else />
              </el-icon>
              {{ visible ? '收起' : '展开' }}
            </el-button>
            <el-button type="primary" @click.stop="handleSearch" :loading="loading" :icon="Search">查询</el-button>
          </el-button-group>
        </el-dropdown>
        <el-button v-else type="primary" @click="handleSearch" :icon="Search" :loading="loading">查询</el-button>
        <el-button @click="handleReset" class="ml-8px" :icon="RefreshLeft">重置</el-button>
        <el-badge v-if="$slots.moreConditions" type="primary" :show-zero="false" :value="searchMoreValue"
          class="ml-8px">
          <el-button @click="showMoreSearchComp = true">更多查询</el-button>
        </el-badge>
        <el-drawer v-model="showMoreSearchComp" title="更多条件查询" size="50%">
          <template #header>
            <div class="dialog-header text-#333 text-18px text-bold py-15px pl-15px">
              更多条件查询
            </div>
          </template>
          <slot name="moreConditions" :scope="form"></slot>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showMoreSearchComp = false" :icon="Close">取 消</el-button>
              <el-button type="primary" @click="handleSearch" :icon="Check">确 定</el-button>
            </div>
          </template>
        </el-drawer>
      </div>
    </div>
  </el-form>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Search, RefreshLeft, ArrowDown, ArrowUp, Close, Check } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'

const props = defineProps({
  searchParams: {
    type: Object,
    default: () => ({})
  },
  labelWidth: {
    type: String,
    default: 'auto'
  },
  loading: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['search', 'reset'])
const initSearchParams = cloneDeep(props.searchParams)
const form = ref<any>(props.searchParams)
const visible = ref<boolean>(false)
const showMoreSearchComp = ref<boolean>(false)
const searchFormRef = ref<any>(null)
const showFields = ref<Record<string, any>>({})
const hideFields = ref<Record<string, any>>({})

watch(() => showMoreSearchComp.value, (val) => {
  if (val) {
    nextTick(() => {
      hideFields.value = {}
      const formFields = searchFormRef.value?.fields || []
      formFields.forEach((field: any) => {
        if (!showFields.value[field.prop]) {
          hideFields.value[field.prop] = field.label
        }
      })
    })
  }
})

onMounted(() => {
  nextTick(() => {
    if (searchFormRef.value) {
      showFields.value = {}
      const formFields = searchFormRef.value.fields || []
      formFields.forEach((field: any) => {
        showFields.value[field.prop] = field
      })
    }
  })
})

const searchMoreValue = computed(() => {
  let num = 0
  for (const key in hideFields.value) {
    const value = form.value[key]
    if (Array.isArray(value)) {
      if (value.length > 0 && value.some(item => item !== null && item !== undefined && item !== '')) {
        num++
      }
    } else if (value !== null && value !== undefined && value !== '') {
      num++
    }
  }
  return num
})

function handleVisibleChange(val: boolean) {
  visible.value = val
}

function handleSearch() {
  showMoreSearchComp.value = false
  emit('search', form.value)
}

function handleReset() {
  form.value = cloneDeep(initSearchParams)
  emit('reset', form.value)
}
</script>
<style lang="scss">
.hide-position {
  display: flex;
  flex-direction: column;
  padding: 15px 20px 0 0;
  max-height: 525px;
  overflow-y: auto;
  min-width: 600px;

  .el-form-item__label {
    padding: 0 12px 0 12px !important;
    font-size: var(--el-font-size-base);
  }
}
</style>
<style lang="scss" scoped>
.search-form {
  ::v-deep .el-form-item {
    margin-bottom: 10px;
  }
  ::v-deep .el-drawer__header {
    margin-bottom: 0;
    padding: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  ::v-deep .el-drawer__close-btn {
    padding-right: 15px;
  }

  ::v-deep .el-drawer__footer {
    padding: 20px 20px 20px 0;
    border-top: 1px solid var(--el-border-color-light);
  }
  .visible-conditions {
    width: 100%;
    display: grid;
    align-items: center;
    grid-template-rows: repeat(1, 1fr);
    grid-template-columns: 3fr 3fr 3fr 3fr 1fr;

    .button-group {
      display: flex;
      flex-wrap: nowrap;
      margin-bottom: 10px;

      ::v-deep .el-button-group {
        display: flex;
      }
    }

    ::v-deep .el-form-item {
      display: flex;
      white-space: nowrap;
    }

    ::v-deep .el-form-item>.el-form-item__content {
      width: 100%;
    }
  }

  ::v-deep .el-date-editor {
    width: 100%;
  }

  ::v-deep .el-select {
    width: 100%;
  }
}
</style>