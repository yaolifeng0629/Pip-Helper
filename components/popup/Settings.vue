<!-- 设置组件 - 管理黑白名单和快捷键设置 -->
<script setup lang="ts">
import { ref } from 'vue';
import { UserSettings } from '../../utils/storage';

// 组件属性
interface Props {
    settings: UserSettings;
    onSave: (settings: Partial<UserSettings>) => void;
}

const props = defineProps<Props>();

// 组件状态
const whitelist = ref<string[]>(props.settings.whitelist);
const blacklist = ref<string[]>(props.settings.blacklist);
const newDomain = ref('');
const isWhitelistMode = ref(true);

// 添加域名到黑/白名单
function addDomain() {
    if (!newDomain.value) return;

    if (isWhitelistMode.value) {
        if (!whitelist.value.includes(newDomain.value)) {
            whitelist.value = [...whitelist.value, newDomain.value];
            props.onSave({ whitelist: whitelist.value });
        }
    } else {
        if (!blacklist.value.includes(newDomain.value)) {
            blacklist.value = [...blacklist.value, newDomain.value];
            props.onSave({ blacklist: blacklist.value });
        }
    }

    newDomain.value = '';
}

// 从黑/白名单中移除域名
function removeDomain(domain: string) {
    if (isWhitelistMode.value) {
        whitelist.value = whitelist.value.filter(d => d !== domain);
        props.onSave({ whitelist: whitelist.value });
    } else {
        blacklist.value = blacklist.value.filter(d => d !== domain);
        props.onSave({ blacklist: blacklist.value });
    }
}
</script>

<template>
    <div class="pip-settings">
        <div class="pip-settings-section">
            <div class="pip-settings-title">
                <div class="pip-settings-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path
                            d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                        ></path>
                    </svg>
                </div>
                Blacklist / Whitelist
            </div>
            <div class="pip-radio-group">
                <label class="pip-radio-label">
                    <input type="radio" v-model="isWhitelistMode" :value="true" class="pip-radio" />
                    <span class="pip-radio-text">Whitelist</span>
                </label>
                <label class="pip-radio-label">
                    <input type="radio" v-model="isWhitelistMode" :value="false" class="pip-radio" />
                    <span class="pip-radio-text">Blacklist</span>
                </label>
            </div>

            <div class="pip-domain-add">
                <input
                    v-model="newDomain"
                    placeholder="Enter domain, e.g.: bilibili.com"
                    class="pip-input"
                    @keyup.enter="addDomain"
                />
                <button @click="addDomain" class="pip-btn">Add</button>
            </div>

            <div class="pip-domain-list" v-if="isWhitelistMode">
                <div v-for="domain in whitelist" :key="domain" class="pip-domain-item">
                    <span class="pip-domain-text">{{ domain }}</span>
                    <button @click="() => removeDomain(domain)" class="pip-btn-remove">
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path
                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                            ></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
                <div v-if="whitelist.length === 0" class="pip-empty-list">
                    Whitelist is empty, PiP can be used on all websites
                </div>
            </div>

            <div class="pip-domain-list" v-else>
                <div v-for="domain in blacklist" :key="domain" class="pip-domain-item">
                    <span class="pip-domain-text">{{ domain }}</span>
                    <button @click="() => removeDomain(domain)" class="pip-btn-remove">
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path
                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                            ></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
                <div v-if="blacklist.length === 0" class="pip-empty-list">
                    Blacklist is empty, PiP can be used on all websites
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pip-settings {
    background: #fff;
    border-radius: 8px;
    padding: 0;
    margin: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 1px solid #e5e7eb;
}

.pip-settings-section {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.pip-settings-section:last-child {
    border-bottom: none;
}

.pip-settings-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1f2937;
    font-size: 15px;
}

.pip-settings-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pip-radio-group {
    display: flex;
    margin-bottom: 16px;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
}

.pip-radio-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    cursor: pointer;
    position: relative;
    border-radius: 6px;
    transition: all 0.2s;
}

.pip-radio-label:has(.pip-radio:checked) {
    background: #3b82f6;
    color: white;
}

.pip-radio {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.pip-radio-text {
    font-size: 14px;
    font-weight: 500;
}

.pip-domain-add {
    display: flex;
    margin-bottom: 16px;
}

.pip-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
    background: #f9fafb;
}

.pip-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.pip-btn {
    margin-left: 8px;
    padding: 0 16px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.pip-btn:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

.pip-btn:active {
    transform: translateY(1px);
}

.pip-domain-list {
    max-height: 200px;
    overflow-y: auto;
    border-radius: 8px;
    background: #f9fafb;
    padding: 4px;
}

.pip-domain-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 4px;
    background: #fff;
    border-radius: 6px;
    transition: all 0.2s;
    border: 1px solid #f3f4f6;
}

.pip-domain-item:hover {
    background: #f9fafb;
}

.pip-domain-text {
    font-size: 14px;
    color: #4b5563;
}

.pip-btn-remove {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.pip-btn-remove:hover {
    background: #fee2e2;
}

.pip-empty-list {
    color: #6b7280;
    font-style: italic;
    padding: 12px;
    text-align: left;
    font-size: 14px;
}
</style>
