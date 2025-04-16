<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="用户名" prop="name">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="密码" prop="pwd">
      <el-input type="pwd" v-model="form.pwd" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const formRef = ref(); // 表单实例
const form = ref({
  name: '',
  pwd: '',
});

const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度在 3 到 15 个字符', trigger: 'blur' },
  ],
  pwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' },
  ],
};

// 暴露验证和提交方法
function submit() {
  return new Promise((resolve, reject) => {
    formRef.value?.validate((valid: boolean) => {
      if (valid) {
        console.log('表单验证通过:', form.value);
        resolve(true);
      } else {
        console.error('表单验证未通过');
        reject(new Error('表单验证未通过'));
      }
    });
  });
}

defineExpose({
  submit,
});
</script>