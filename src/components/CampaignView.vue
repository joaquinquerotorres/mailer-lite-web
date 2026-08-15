<template>
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="view-campaign-title">
    <div class="modal">
      <div class="modal-header">
        <h2 id="view-campaign-title">View campaign {{ campaign?.name }}</h2>
        <button type="button" class="close" aria-label="Close" @click="$emit('close')">
          ×
        </button>
      </div>

      <div v-if="loading" class="loading">
        Loading campaign...
      </div>

      <div v-else-if="campaign" class="campaign-fields">
        <label>
          Name
          <input
            type="text"
            disabled
            :value="campaign.name"
          >
        </label>

        <label>
          Start date
          <input
            disabled
            :value="campaign.startDate"
          >
        </label>

        <label>
          End date
          <input
            disabled
            :value="campaign.endDate"
          >
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from 'vue'

const API_URL = 'http://localhost:8000/api/campaigns'

const props = defineProps({
  uuid: {
    type: String,
    required: true
  }
})

const campaign = ref(null)
const loading = ref(false)

onMounted(() => {
  fetchCampaign()
})

const fetchCampaign = async () => {
  const response = await fetch(`${API_URL}/${props.uuid}`)
  const data = await response.json()
  campaign.value = data
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

.campaign-fields {
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
</style>