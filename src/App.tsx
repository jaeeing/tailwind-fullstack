import { useState, useEffect } from 'react'

// API 기본 URL
const API_URL = 'http://localhost:3000/api/users'

// User 타입 정의
interface User {
  id: number
  email: string
  name: string | null
}

// 폼 데이터 타입
interface UserForm {
  email: string
  name: string
}

// 토스트 타입
interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

// 정렬 타입
type SortField = 'name' | 'email' | 'id'
type SortOrder = 'asc' | 'desc'

// 뷰 모드 타입
type ViewMode = 'grid' | 'list'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 다크모드 상태 (localStorage에서 초기값 로드)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  
  // 뷰 모드 상태
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  
  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('')
  
  // 정렬 상태
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  
  // 폼 상태
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserForm>({
    email: '',
    name: ''
  })

  // 토스트 상태
  const [toasts, setToasts] = useState<Toast[]>([])

  // 다크모드 토글 및 저장
  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => {
      const newValue = !prev
      localStorage.setItem('darkMode', JSON.stringify(newValue))
      return newValue
    })
    addToast(isDarkMode ? '☀️ 라이트 모드로 전환했습니다' : '🌙 다크 모드로 전환했습니다', 'info')
  }

  // 뷰 모드 토글
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'grid' : 'list')
    addToast(viewMode === 'list' ? '📱 그리드 뷰로 전환' : '📋 리스트 뷰로 전환', 'info')
  }

  // 토스트 추가 함수
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('사용자 목록을 불러올 수 없습니다.')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 사용자 생성
  const createUser = async (data: UserForm) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '사용자 생성에 실패했습니다.')
      }
      
      await fetchUsers()
      closeForm()
      addToast('✅ 사용자가 추가되었습니다!', 'success')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      addToast(errorMsg, 'error')
    }
  }

  // 사용자 수정
  const updateUser = async (id: number, data: UserForm) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '사용자 수정에 실패했습니다.')
      }
      
      await fetchUsers()
      closeForm()
      addToast('✅ 사용자 정보가 수정되었습니다!', 'success')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      addToast(errorMsg, 'error')
    }
  }

  // 사용자 삭제
  const deleteUser = async (id: number) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('사용자 삭제에 실패했습니다.')
      
      await fetchUsers()
      addToast('🗑️ 사용자가 삭제되었습니다.', 'info')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      addToast(errorMsg, 'error')
    }
  }

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      addToast('이메일을 입력해주세요.', 'error')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      addToast('올바른 이메일 형식이 아닙니다.', 'error')
      return
    }
    
    if (editingUser) {
      updateUser(editingUser.id, formData)
    } else {
      createUser(formData)
    }
  }

  // 편집 시작
  const startEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name || ''
    })
    setIsFormOpen(true)
  }

  // 폼 닫기
  const closeForm = () => {
    setIsFormOpen(false)
    setEditingUser(null)
    setFormData({ email: '', name: '' })
  }

  // 정렬 변경
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // 검색 및 정렬된 사용자 목록
  const filteredAndSortedUsers = users
    .filter(user => {
      const searchLower = searchTerm.toLowerCase()
      return (
        user.email.toLowerCase().includes(searchLower) ||
        (user.name?.toLowerCase().includes(searchLower) || false)
      )
    })
    .sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''
      
      if (sortField === 'name') {
        aVal = (a.name || '').toLowerCase()
        bVal = (b.name || '').toLowerCase()
      } else if (sortField === 'email') {
        aVal = a.email.toLowerCase()
        bVal = b.email.toLowerCase()
      } else {
        aVal = a.id
        bVal = b.id
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  // 통계 계산
  const stats = {
    total: users.length,
    withName: users.filter(u => u.name).length,
    withoutName: users.filter(u => !u.name).length,
    domains: [...new Set(users.map(u => u.email.split('@')[1]))].length
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* 토스트 컨테이너 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`min-w-[300px] px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-4 text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 헤더 */}
      <header className={`shadow-sm border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                👥 사용자 관리
              </h1>
              <p className={`mt-1 text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                다크모드 + 그리드뷰 + 통계 대시보드
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 다크모드 토글 */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg shadow-yellow-500/50'
                    : 'bg-gray-700 text-yellow-400 hover:bg-gray-800 shadow-lg shadow-gray-500/50'
                }`}
                title={isDarkMode ? '라이트 모드' : '다크 모드'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {/* 뷰 모드 토글 */}
              <button
                onClick={toggleViewMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={viewMode === 'list' ? '그리드 뷰' : '리스트 뷰'}
              >
                {viewMode === 'list' ? '📱' : '📋'}
              </button>

              {/* 새 사용자 추가 */}
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 사용자
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 대시보드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: '전체 사용자', value: stats.total, icon: '👥', color: 'from-blue-500 to-blue-600' },
            { label: '이름 있음', value: stats.withName, icon: '✅', color: 'from-green-500 to-green-600' },
            { label: '이름 없음', value: stats.withoutName, icon: '⚠️', color: 'from-yellow-500 to-yellow-600' },
            { label: '도메인 수', value: stats.domains, icon: '🌐', color: 'from-purple-500 to-purple-600' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className={`bg-gradient-to-r ${stat.color} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
              </div>
              <div className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="text-sm font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 검색 및 정렬 바 */}
        <div className={`mb-6 rounded-lg shadow-sm border p-4 transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md leading-5 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'
                  } sm:text-sm`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 정렬 버튼 */}
            <div className="flex gap-2">
              {[
                { field: 'name' as SortField, label: '이름' },
                { field: 'email' as SortField, label: '이메일' },
                { field: 'id' as SortField, label: '최신순' }
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    sortField === field
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label} {sortField === field && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>

          {searchTerm && (
            <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-semibold text-indigo-500">{filteredAndSortedUsers.length}</span>개의 검색 결과
            </div>
          )}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className={`border-l-4 p-4 mb-6 rounded-r-lg ${
            isDarkMode ? 'bg-red-900/50 border-red-500' : 'bg-red-50 border-red-400'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
          </div>
        )}

        {/* 사용자 목록 */}
        {!loading && !error && (
          <>
            {filteredAndSortedUsers.length === 0 ? (
              <div className={`text-center py-12 rounded-lg shadow-sm border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {searchTerm ? '검색 결과가 없습니다' : '사용자가 없습니다'}
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {searchTerm ? '다른 검색어를 시도해보세요.' : '새 사용자를 추가하여 시작하세요.'}
                </p>
              </div>
            ) : viewMode === 'list' ? (
              // 리스트 뷰
              <div className={`shadow-sm rounded-lg border overflow-hidden ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-3 border-b ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    총 <span className="font-semibold text-indigo-500">{filteredAndSortedUsers.length}</span>명의 사용자
                  </p>
                </div>
                <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredAndSortedUsers.map((user) => (
                    <li key={user.id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {user.name || '이름 없음'}
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(user)}
                            className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                              isDarkMode
                                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            수정
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            삭제
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              // 그리드 뷰
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-center">
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-3xl shadow-xl">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <h3 className={`text-lg font-semibold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name || '이름 없음'}
                      </h3>
                      <p className={`text-sm text-center mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.email}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="flex-1 px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 모달 폼 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeForm}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className={`text-lg leading-6 font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {editingUser ? '사용자 수정' : '새 사용자 추가'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            이메일 *
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'
                            } sm:text-sm`}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div>
                          <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            이름
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'
                            } sm:text-sm`}
                            placeholder="홍길동"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 transition-colors sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingUser ? '수정하기' : '추가하기'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium transition-colors sm:mt-0 sm:w-auto sm:text-sm ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-gray-200 hover:bg-gray-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 애니메이션 */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default App
