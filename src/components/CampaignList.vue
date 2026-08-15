<template>
  <div class="campaigns-page">
    <div
      class="campaign-list"
      :class="{ 'is-disabled': isCreateOpen || isViewOpen }"
      :aria-hidden="isCreateOpen || isViewOpen"
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
    </template>
    </div>
  </div>
</template>

<script setup>

const API_URL = 'http://localhost:8000/api/campaigns'
const LIMIT = 5
const ARROW_DEBOUNCE_MS = 400

import { ref, computed, onMounted, onUnmounted } from 'vue'
const campaigns = ref([])
const loading = ref(false)
const hasPrev = ref(false)
const hasNext = ref(false)
const prevCursor = ref(null)
const nextCursor = ref(null)
const pageDebounceTimer =  ref(null)

hasNext.value = computed(() => nextCursor.value !== null && nextCursor.value !== '')
hasPrev.value = computed(() => prevCursor.value !== null && prevCursor.value !== '')

onMounted(() => {
  fetchCampaigns()
})

onUnmounted(() => {
  clearTimeout(pageDebounceTimer.value)
})

const fetchCampaigns = async (cursor = null) => {
  loading.value = true
  try {
    const params = new URLSearchParams({ limit: String(LIMIT) })
    if (cursor) {
      params.set('cursor', cursor)
    }
    const response = await fetch(`${API_URL}?${params.toString()}`)
    const data = await response.json()
    campaigns.value = data.items
    nextCursor.value = data.nextCursor
    prevCursor.value = data.prevCursor
  } catch (error) {
    console.error('Error fetching campaigns:', error)
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
