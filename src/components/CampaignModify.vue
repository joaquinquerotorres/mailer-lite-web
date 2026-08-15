<template>
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modify-campaign-title">
    <div class="modal">
      <div class="modal-header">
        <h2 id="modify-campaign-title">Modify campaign</h2>
        <button type="button" class="close" aria-label="Close" @click="emit('close')">
          ×
        </button>
      </div>

      <p v-if="successMessage" class="message success">{{ successMessage }}</p>
      <p v-if="formMessage" class="message error">{{ formMessage }}</p>

      <div v-if="loading" class="loading">
        Loading campaign...
      </div>

      <form v-else @submit.prevent="submit">
        <label>
          Name
          <input
            v-model="name"
            type="text"
            maxlength="255"
          >
          <span v-for="error in errorsFor('name')" :key="error" class="field-error">
            {{ error }}
          </span>
        </label>

        <label>
          Start date
          <input
            v-model="startDate"
            type="date"
            :min="minStartDate"
          >
          <span v-for="error in errorsFor('startDate')" :key="error" class="field-error">
            {{ error }}
          </span>
        </label>

        <label>
          End date
          <input
            v-model="endDate"
            type="date"
            :min="minEndDate"
          >
          <span v-for="error in errorsFor('endDate')" :key="error" class="field-error">
            {{ error }}
          </span>
        </label>

        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? 'Sending...' : 'Submit' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineProps, defineEmits } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api/campaigns'

const emit = defineEmits(['modified', 'close'])

const props = defineProps({
  uuid: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const name = ref('')
const startDate = ref('')
const endDate = ref('')
const submitting = ref(false)
const successMessage = ref('')
const formMessage = ref('')
const errors = ref({})

onMounted(() => {
  fetchCampaign()
})

const fetchCampaign = async () => {
  loading.value = true
  formMessage.value = ''

  try {
    const response = await fetch(`${API_URL}/${props.uuid}`)
    if (!response.ok) {
      throw new Error('Could not load the campaign.')
    }

    const data = await response.json()
    name.value = data.name || ''
    startDate.value = data.startDate || ''
    endDate.value = data.endDate || ''
  } catch (error) {
    formMessage.value = error.message || 'Could not load the campaign.'
  } finally {
    loading.value = false
  }
}

const toDate = (calendarDate) => {
  if (calendarDate instanceof Date) {
    return new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate())
  }

  return new Date(`${calendarDate}T00:00:00`)
}

const toISODate = (calendarDate) => {
  const date = toDate(calendarDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const addDays = (calendarDate, days) => {
  const newDate = toDate(calendarDate)
  newDate.setDate(newDate.getDate() + days)

  return toISODate(newDate)
}

const minStartDate = computed(() => addDays(new Date(), 1))
const minEndDate = computed(() => {
  if (startDate.value) {
    return addDays(startDate.value, 1)
  }

  return addDays(minStartDate.value, 1)
})

watch(startDate, (nextStart, prevStart) => {
  if (!prevStart || !endDate.value || endDate.value >= minEndDate.value) {
    return
  }

  endDate.value = ''
})

const errorsFor = (field) => {
  const fieldErrors = errors.value && typeof errors.value === 'object' ? errors.value : {}
  const snake = field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  return fieldErrors[field] || fieldErrors[snake] || []
}

const validate = () => {
  const errorsObject = {}

  if (!name.value.trim()) {
    errorsObject.name = ['The name field is required.']
  } else if (name.value.length > 255) {
    errorsObject.name = ['The name may not be greater than 255 characters.']
  }

  if (!startDate.value) {
    errorsObject.startDate = ['The start date field is required.']
  } else if (startDate.value <= toISODate(new Date())) {
    errorsObject.startDate = ['The start date must be a date after today.']
  }

  if (!endDate.value) {
    errorsObject.endDate = ['The end date field is required.']
  } else if (startDate.value && endDate.value <= startDate.value) {
    errorsObject.endDate = ['The end date must be a date after start date.']
  }

  errors.value = errorsObject

  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  successMessage.value = ''
  formMessage.value = ''
  errors.value = {}

  if (!validate()) {
    return
  }

  submitting.value = true

  try {
    const response = await axios.put(`${API_URL}/${props.uuid}`, {
      name: name.value.trim(),
      startDate: startDate.value,
      endDate: endDate.value
    })

    successMessage.value = response.data?.message || 'Campaign updated successfully.'
    emit('modified')
  } catch (error) {
    const data = error.response?.data || {}
    errors.value = data.errors && typeof data.errors === 'object' ? data.errors : {}
    formMessage.value = data.message
      || (error.response ? 'The given data was invalid.' : 'Could not update the campaign. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  z-index: 10;
}

.modal {
  --tw-bg-opacity: 1;
  --ml-green: rgb(9 194 105 / var(--tw-bg-opacity));
  width: 100%;
  max-width: 420px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  text-align: left;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close {
  border: none;
  background: none;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  color: #666;
}

.loading {
  padding: 8px 0 16px;
  font-size: 14px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

input {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.message {
  margin: 0 0 16px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
}

.success {
  background: #e8f8ef;
  color: #087a42;
}

.error {
  background: #fdecec;
  color: #b42318;
}

.field-error {
  color: #b42318;
  font-size: 12px;
}

.btn-submit {
  align-self: flex-end;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: var(--ml-green);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
