<template>
  <div class="campaigns-page">
    <div
      class="campaign-list"
      :class="{ 'is-disabled': isViewOpen || isCreateOpen || isModifyOpen }"
      :aria-hidden="isViewOpen || isCreateOpen || isModifyOpen"
    >
    <h2>Campaigns</h2>

    <div v-if="loading" class="loading">
      Loading campaigns...
    </div>

    <template v-else>
      <ul>
        <li v-for="campaign in campaigns" :key="campaign.id">
          <span class="name">{{ campaign.name }}</span>
          <span class="dates">{{ campaign.startDate }} – {{ campaign.endDate }}</span>
          <div class="actions">
            <button
              type="button"
              class="btn"
              aria-label="Consult"
              title="Consult"
              @click="consultCampaign(campaign.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              type="button"
              class="btn"
              aria-label="Modify"
              title="Modify"
              @click="modifyCampaign(campaign.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </li>
      </ul>

      <div class="pagination">
        <button
          v-if="hasPrev"
          type="button"
          class="arrow"
          aria-label="Previous page"
          @click="goToPage(prevCursor)"
        >
          ←
        </button>
        <button
          v-if="hasNext"
          type="button"
          class="arrow"
          aria-label="Next page"
          @click="goToPage(nextCursor)"
        >
          →
        </button>
      </div>
      <button
        type="button"
        class="btn btn-create"
        @click="createCampaign"
      >
        Create
      </button>
    </template>
    </div>

    <CampaignCreate
      v-if="isCreateOpen"
      @close="isCreateOpen = false"
      @create="reloadCampaigns"
    />
    <CampaignView
      v-if="isViewOpen"
      :uuid="campaignUuid"
      @close="isViewOpen = false"
    />
    <CampaignModify
      v-if="isModifyOpen"
      :uuid="campaignUuid"
      @close="isModifyOpen = false"
      @modified="reloadCampaigns"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CampaignView from './CampaignView.vue'
import CampaignCreate from './CampaignCreate.vue'
import CampaignModify from './CampaignModify.vue'

const API_URL = 'http://localhost:8000/api/campaigns'
const LIMIT = 5
const ARROW_DEBOUNCE_MS = 400

const campaigns = ref([])
const loading = ref(false)
const prevCursor = ref(null)
const nextCursor = ref(null)
const pageDebounceTimer = ref(null)
const campaignUuid = ref(null)
const isViewOpen = ref(false)
const isCreateOpen = ref(false)
const isModifyOpen = ref(false)

const hasNext = computed(() => nextCursor.value !== null && nextCursor.value !== '')
const hasPrev = computed(() => prevCursor.value !== null && prevCursor.value !== '')

onMounted(() => {
  fetchCampaigns()
})

onUnmounted(() => {
  clearTimeout(pageDebounceTimer.value)
})

const consultCampaign = (uuid) => {
  campaignUuid.value = uuid
  isViewOpen.value = true
}

const modifyCampaign = (uuid) => {
  campaignUuid.value = uuid
  isModifyOpen.value = true
}

const createCampaign = () => {
  isCreateOpen.value = true
}

const reloadCampaigns = () => {
  fetchCampaigns()
}

const fetchCampaigns = async (cursor = null) => {
  loading.value = true
  try {
    const params = new URLSearchParams({ limit: String(LIMIT) })
    if (typeof cursor === 'string' && cursor) {
      params.set('cursor', cursor)
    }
    const response = await fetch(`${API_URL}?${params.toString()}`)
    const data = await response.json()
    campaigns.value = Array.isArray(data.items) ? data.items : []
    nextCursor.value = data.nextCursor ?? null
    prevCursor.value = data.prevCursor ?? null
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    campaigns.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (cursor) => {
    if (loading.value) return
    clearTimeout(pageDebounceTimer.value)
    pageDebounceTimer.value = setTimeout(() => {
      fetchCampaigns(cursor)
    }, ARROW_DEBOUNCE_MS)
}
</script>

<style scoped>
.campaign-list {
  --tw-bg-opacity: 1;
  --ml-green: rgb(9 194 105 / var(--tw-bg-opacity));
  text-align: left;
}

.campaign-list.is-disabled {
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
}

.loading {
  padding: 16px 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 8px 0;
}

.dates {
  color: #666;
}

.actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: var(--ml-green);
  color: #fff;
  cursor: pointer;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn-create {
  width: auto;
  height: auto;
  margin-top: 16px;
  padding: 8px 16px;
  font-size: 14px;
}

.pagination {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.arrow {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  padding: 0 4px;
}
</style>
