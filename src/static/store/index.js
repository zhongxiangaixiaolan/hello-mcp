import { createStore } from 'vuex'
import io from 'socket.io-client'

// 创建Vuex store实例
const store = createStore({
  state() {
    return {
      // WebSocket连接状态
      socket: null,
      isConnected: false,
      connectionStatus: 'disconnected', // connected, disconnected, connecting
      connectionText: '连接中...',

      // 工作汇报数据
      workSummary: null,
      lastWorkSummary: null,

      // 用户反馈数据
      feedbackText: '',
      selectedImages: [],

      // 会话数据
      currentFeedbackSession: null,
      sessionTimeoutDuration: 300000, // 5分钟

      // 自动刷新数据
      autoRefreshInterval: null,
      autoRefreshCountdown: 10,

      // 状态消息
      statusMessages: [],

      // 超时倒计时
      timeoutCountdown: null,
      showTimeoutCountdown: false
    }
  },
  
  mutations: {
    // 更新连接状态
    SET_CONNECTION_STATUS(state, { isConnected, status, text }) {
      state.isConnected = isConnected
      state.connectionStatus = status
      state.connectionText = text
    },
    
    // 设置工作汇报数据
    SET_WORK_SUMMARY(state, summary) {
      state.workSummary = summary
      state.lastWorkSummary = summary
    },
    
    // 设置反馈文本
    SET_FEEDBACK_TEXT(state, text) {
      state.feedbackText = text
    },
    
    // 添加图片到反馈
    ADD_FEEDBACK_IMAGE(state, image) {
      state.selectedImages.push(image)
    },
    
    // 移除反馈图片
    REMOVE_FEEDBACK_IMAGE(state, index) {
      state.selectedImages.splice(index, 1)
    },

    // 设置反馈图片
    SET_SELECTED_IMAGES(state, images) {
      state.selectedImages = images
    },
    
    // 清空反馈表单
    CLEAR_FEEDBACK_FORM(state) {
      state.feedbackText = ''
      state.selectedImages = []
    },
    
    // 设置当前反馈会话
    SET_FEEDBACK_SESSION(state, sessionId) {
      state.currentFeedbackSession = sessionId
    },

    // 设置Socket实例
    SET_SOCKET(state, socket) {
      state.socket = socket
    },



    // 状态消息相关
    ADD_STATUS_MESSAGE(state, message) {
      state.statusMessages.push({
        id: Date.now(),
        type: message.type || 'info',
        text: message.text,
        timestamp: Date.now()
      })
    },

    REMOVE_STATUS_MESSAGE(state, id) {
      state.statusMessages = state.statusMessages.filter(msg => msg.id !== id)
    },

    CLEAR_STATUS_MESSAGES(state) {
      state.statusMessages = []
    },

    // 设置最后的工作汇报
    SET_LAST_WORK_SUMMARY(state, summary) {
      state.lastWorkSummary = summary
    },

    // 设置会话超时相关
    SET_SESSION_TIMEOUT_ID(state, timeoutId) {
      state.sessionTimeoutId = timeoutId
    },

    SET_SESSION_START_TIME(state, startTime) {
      state.sessionStartTime = startTime
    },

    SET_AUTO_SUBMIT_WARNING_SHOWN(state, shown) {
      state.autoSubmitWarningShown = shown
    },


  },
  
  actions: {
    // 更新连接状态
    updateConnectionStatus({ commit }, { isConnected, status, text }) {
      commit('SET_CONNECTION_STATUS', { isConnected, status, text })
    },
    
    // 更新工作汇报
    updateWorkSummary({ commit }, summary) {
      commit('SET_WORK_SUMMARY', summary)
    },
    
    // 更新反馈文本
    updateFeedbackText({ commit }, text) {
      commit('SET_FEEDBACK_TEXT', text)
    },
    
    // 添加反馈图片
    addFeedbackImage({ commit }, image) {
      commit('ADD_FEEDBACK_IMAGE', image)
    },
    
    // 移除反馈图片
    removeFeedbackImage({ commit }, index) {
      commit('REMOVE_FEEDBACK_IMAGE', index)
    },
    
    // 清空反馈表单
    clearFeedbackForm({ commit }) {
      commit('CLEAR_FEEDBACK_FORM')
    },
    
    // 设置反馈会话
    setFeedbackSession({ commit }, sessionId) {
      commit('SET_FEEDBACK_SESSION', sessionId)
    },

    // WebSocket相关actions
    initializeSocket({ commit, dispatch, state }) {
      // 如果已有连接，先断开
      if (state.socket) {
        state.socket.disconnect()
      }

      // 获取当前页面的协议和主机
      const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
      const host = window.location.hostname
      const port = window.location.port || (protocol === 'https' ? '443' : '80')
      const serverUrl = `${protocol}://${host}:${port}`

      console.log('正在连接Socket.IO服务器:', serverUrl)

      const socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 10,
        forceNew: true
      })

      commit('SET_SOCKET', socket)

      // 连接成功
      socket.on('connect', () => {
        dispatch('updateConnectionStatus', {
          isConnected: true,
          status: 'connected',
          text: '已连接'
        })
        console.log('WebSocket已连接')

        // 连接成功后自动处理初始化逻辑
        dispatch('handleSocketConnected')
      })

      // 连接断开
      socket.on('disconnect', () => {
        dispatch('updateConnectionStatus', {
          isConnected: false,
          status: 'disconnected',
          text: '连接断开'
        })
        console.log('WebSocket连接断开')
      })

      // 连接错误
      socket.on('connect_error', (error) => {
        dispatch('updateConnectionStatus', {
          isConnected: false,
          status: 'disconnected',
          text: '连接失败'
        })
        console.error('WebSocket连接错误:', error)
        dispatch('addStatusMessage', {
          type: 'error',
          text: '连接服务器失败，请检查网络或刷新页面重试'
        })
      })

      // 反馈会话开始
      socket.on('feedback_session_started', (data) => {
        console.log('反馈会话已开始:', data)
        commit('SET_FEEDBACK_SESSION', data.sessionId)
        if (data.workSummary) {
          commit('SET_WORK_SUMMARY', data.workSummary)
        }
      })

      // 反馈提交成功
      socket.on('feedback_submitted', (data) => {
        console.log('反馈提交成功:', data)
        dispatch('clearFeedbackForm')
        dispatch('addStatusMessage', {
          type: 'success',
          text: '反馈提交成功！'
        })
        // 清理超时相关状态
        dispatch('clearSessionTimeout')

        // 🔧 新增：重置所有组件的提交状态
        dispatch('resetSubmissionState')

        // 清理会话状态，停止自动刷新
        commit('SET_FEEDBACK_SESSION', null)
        commit('SET_WORK_SUMMARY', null)

        // 通知组件停止自动刷新
        dispatch('stopAutoRefresh')
      })

      // 反馈提交错误
      socket.on('feedback_error', (data) => {
        console.error('反馈提交失败:', data)
        dispatch('addStatusMessage', {
          type: 'error',
          text: data.error || '反馈提交失败'
        })
      })

      // 窗口关闭事件
      socket.on('close_window', (data) => {
        console.log('收到窗口关闭指令:', data)
        dispatch('addStatusMessage', {
          type: 'info',
          text: data.message || '反馈已提交，窗口将关闭'
        })

        // 延迟关闭窗口，让用户看到消息
        setTimeout(() => {
          window.close()
        }, 2000)
      })

      // 工作汇报数据
      socket.on('work_summary_data', (data) => {
        console.log('收到工作汇报数据:', data)
        if (data.work_summary) {
          commit('SET_WORK_SUMMARY', data.work_summary)
          commit('SET_LAST_WORK_SUMMARY', data.work_summary)
        }
      })

      // 最新工作汇报响应
      socket.on('latest_summary_response', (data) => {
        console.log('收到最新工作汇报响应:', data)
        if (data.success && data.work_summary) {
          // 检查内容是否与上次不同
          if (state.lastWorkSummary !== data.work_summary) {
            commit('SET_WORK_SUMMARY', data.work_summary)
            commit('SET_LAST_WORK_SUMMARY', data.work_summary)
            dispatch('addStatusMessage', {
              type: 'success',
              text: '已获取最新工作汇报'
            })
          } else {
            dispatch('addStatusMessage', {
              type: 'info',
              text: '工作汇报内容无变化'
            })
          }
        } else {
          dispatch('addStatusMessage', {
            type: 'error',
            text: data.error || '获取工作汇报失败'
          })
        }
      })

      // 会话分配
      socket.on('session_assigned', (data) => {
        console.log('收到会话分配:', data)
        if (data.session_id) {
          commit('SET_FEEDBACK_SESSION', data.session_id)

          // 如果有工作汇报数据，直接设置
          if (data.work_summary) {
            commit('SET_WORK_SUMMARY', data.work_summary)
            commit('SET_LAST_WORK_SUMMARY', data.work_summary)
          } else {
            // 没有工作汇报数据，主动请求
            setTimeout(() => {
              if (state.socket && state.isConnected) {
                state.socket.emit('get_work_summary', { feedback_session_id: data.session_id })
              }
            }, 500)
          }

          // 启动超时自动提交计时器
          const timeoutToUse = data.timeout || 300000 // 默认5分钟
          const frontendTimeout = Math.max(timeoutToUse - 2000, timeoutToUse * 0.9)
          dispatch('startSessionTimeout', frontendTimeout)

          // 显示成功消息
          dispatch('addStatusMessage', {
            type: 'success',
            text: '已连接到反馈会话，可以开始提交反馈'
          })
        }
      })

      // 无活跃会话
      socket.on('no_active_session', (data) => {
        console.log('无活跃会话:', data)
        dispatch('addStatusMessage', {
          type: 'info',
          text: '当前无活跃的反馈会话。请通过MCP工具调用创建反馈会话，或等待AI创建新的反馈任务。'
        })
      })

      // 🔧 新增：监听新会话可用通知
      socket.on('new_session_available', (data) => {
        console.log('收到新会话通知:', data)

        // 显示通知消息
        dispatch('addStatusMessage', {
          type: 'info',
          text: data.message || '新会话已创建'
        })

        // 延迟500ms后重新请求会话分配
        setTimeout(() => {
          if (state.socket && state.isConnected) {
            console.log('重新请求会话分配...')
            state.socket.emit('request_session')
          }
        }, 500)
      })

      return socket
    },

    // 提交反馈
    submitFeedback({ state }, feedbackData) {
      if (state.socket && state.isConnected) {
        state.socket.emit('submit_feedback', feedbackData)
      } else {
        throw new Error('WebSocket未连接')
      }
    },



    // 处理Socket连接成功后的初始化逻辑
    handleSocketConnected({ state, dispatch }) {
      // 检查URL参数
      const urlParams = new URLSearchParams(window.location.search)
      const mode = urlParams.get('mode')
      const session = urlParams.get('session')

      if (mode === 'feedback' && session) {
        // 传统反馈模式，设置会话ID并获取工作汇报
        dispatch('setFeedbackSession', session)

        // 延迟获取工作汇报，确保连接稳定
        setTimeout(() => {
          if (state.socket && state.isConnected) {
            state.socket.emit('get_work_summary', { feedback_session_id: session })
          }
        }, 500)
      } else {
        // 固定URL模式或默认模式，请求会话分配
        setTimeout(() => {
          if (state.socket && state.isConnected) {
            state.socket.emit('request_session')
          }
        }, 500)
      }
    },

    // 请求最新工作汇报
    requestLatestSummary({ state, dispatch }) {
      if (!state.socket || !state.isConnected) {
        dispatch('addStatusMessage', {
          type: 'error',
          text: '连接已断开，无法刷新'
        })
        return
      }

      dispatch('addStatusMessage', {
        type: 'loading',
        text: '正在获取最新工作汇报...',
        autoHide: false
      })

      state.socket.emit('request_latest_summary')
    },

    // 启动会话超时计时器
    startSessionTimeout({ commit, dispatch }, timeout) {
      // 清除之前的计时器
      dispatch('clearSessionTimeout')

      const timeoutId = setTimeout(() => {
        dispatch('handleSessionTimeout')
      }, timeout)

      commit('SET_SESSION_TIMEOUT_ID', timeoutId)
      commit('SET_SESSION_START_TIME', Date.now())
    },

    // 清除会话超时计时器
    clearSessionTimeout({ state, commit }) {
      if (state.sessionTimeoutId) {
        clearTimeout(state.sessionTimeoutId)
        commit('SET_SESSION_TIMEOUT_ID', null)
      }
      commit('SET_AUTO_SUBMIT_WARNING_SHOWN', false)
    },

    // 处理会话超时
    handleSessionTimeout({ dispatch }) {
      dispatch('addStatusMessage', {
        type: 'warning',
        text: '会话即将超时，正在自动提交反馈...'
      })

      // 这里可以添加自动提交逻辑
      // dispatch('submitFeedback', { /* 自动提交数据 */ })
    },

    // 停止自动刷新
    stopAutoRefresh() {
      // 发送全局事件，通知所有组件停止自动刷新
      window.dispatchEvent(new CustomEvent('stopAutoRefresh'))
    },

    // 重置提交状态
    resetSubmissionState() {
      // 发送全局事件，通知所有组件重置提交状态
      window.dispatchEvent(new CustomEvent('resetSubmissionState'))
    },

    // 添加状态消息的便捷方法
    addStatusMessage({ commit }, message) {
      const messageWithId = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...message
      }
      commit('ADD_STATUS_MESSAGE', messageWithId)
    },

    // 移除状态消息
    removeStatusMessage({ commit }, id) {
      commit('REMOVE_STATUS_MESSAGE', id)
    },

    // 清空所有状态消息
    clearAllStatusMessages({ commit }) {
      commit('CLEAR_STATUS_MESSAGES')
    }
  },
  
  getters: {
    // 获取连接状态
    connectionStatus: state => ({
      isConnected: state.isConnected,
      status: state.connectionStatus,
      text: state.connectionText
    }),
    
    // 获取工作汇报
    workSummary: state => state.workSummary,
    
    // 获取反馈文本
    feedbackText: state => state.feedbackText,
    
    // 获取反馈图片
    selectedImages: state => state.selectedImages,

    // 获取反馈会话ID
    feedbackSessionId: state => state.currentFeedbackSession,

    // 获取Socket实例
    socket: state => state.socket,

    // 获取状态消息
    statusMessages: state => state.statusMessages,

    // 获取最新状态消息
    latestStatusMessage: state => {
      return state.statusMessages.length > 0
        ? state.statusMessages[state.statusMessages.length - 1]
        : null
    },

    // 检查是否有错误消息
    hasErrorMessage: state => {
      return state.statusMessages.some(msg => msg.type === 'error')
    },

    // 获取最后的工作汇报
    lastWorkSummary: state => state.lastWorkSummary,

    // 获取会话超时相关状态
    sessionTimeoutId: state => state.sessionTimeoutId,
    sessionStartTime: state => state.sessionStartTime,
    autoSubmitWarningShown: state => state.autoSubmitWarningShown,

    // 获取超时倒计时状态
    timeoutCountdown: state => state.timeoutCountdown,
    showTimeoutCountdown: state => state.showTimeoutCountdown
  }
})

export default store