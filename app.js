/**
 * 桩基检测劳务管理系统 - 主应用框架 (Supabase云端版)
 */

// Supabase 配置
var SUPABASE_URL = 'https://fymwdwocxvnduyofwcvi.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_gm6hXPqMEXFz_ZzjFaWHoQ_d-GOV48h';

// 创建 Supabase 客户端
var supabase = null;

// 应用配置
var AppConfig = {
    pages: {
        equipment: { title: '劳务设备管理' },
        contract: { title: '劳务合同管理' },
        transfer: { title: '设备流转登记' },
        work: { title: '日常工作量登记' }
    },
    currentPage: 'equipment',
    isReady: false
};

// 存储管理器 - 基于 Supabase
var StorageManager = {
    // 初始化 Supabase
    init: function() {
        if (typeof supabase === 'undefined') {
            console.error('Supabase SDK 未加载');
            return false;
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        AppConfig.isReady = true;
        return true;
    },
    
    // 通用查询方法
    query: function(table, options) {
        return new Promise(function(resolve, reject) {
            if (!AppConfig.isReady) {
                reject(new Error('Supabase 未初始化'));
                return;
            }
            
            var query = supabase.from(table).select(options.select || '*');
            
            if (options.filter) {
                Object.keys(options.filter).forEach(function(key) {
                    query = query.eq(key, options.filter[key]);
                });
            }
            
            if (options.order) {
                query = query.order(options.order.column, { ascending: options.order.ascending !== false });
            }
            
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            query.then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data);
                }
            }).catch(reject);
        });
    },
    
    // 插入数据
    insert: function(table, data) {
        return new Promise(function(resolve, reject) {
            if (!AppConfig.isReady) {
                reject(new Error('Supabase 未初始化'));
                return;
            }
            
            supabase.from(table).insert([data]).then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data);
                }
            }).catch(reject);
        });
    },
    
    // 更新数据
    update: function(table, id, data) {
        return new Promise(function(resolve, reject) {
            if (!AppConfig.isReady) {
                reject(new Error('Supabase 未初始化'));
                return;
            }
            
            supabase.from(table).update(data).eq('id', id).then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data);
                }
            }).catch(reject);
        });
    },
    
    // 删除数据
    delete: function(table, id) {
        return new Promise(function(resolve, reject) {
            if (!AppConfig.isReady) {
                reject(new Error('Supabase 未初始化'));
                return;
            }
            
            supabase.from(table).delete().eq('id', id).then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data);
                }
            }).catch(reject);
        });
    },
    
    // 获取所有设备类型
    getEquipmentTypes: function() {
        return this.query('equipment_types', { order: { column: 'id', ascending: true } });
    },
    
    // 获取设备库存
    getEquipmentInventory: function() {
        return this.query('equipment_inventory', { order: { column: 'id', ascending: true } });
    },
    
    // 更新设备库存
    updateEquipmentInventory: function(id, data) {
        return this.update('equipment_inventory', id, data);
    },
    
    // 获取所有合同/项目
    getContracts: function() {
        return this.query('contracts', { order: { column: 'id', ascending: true } });
    },
    
    // 添加合同
    addContract: function(data) {
        return this.insert('contracts', data);
    },
    
    // 更新合同
    updateContract: function(id, data) {
        return this.update('contracts', id, data);
    },
    
    // 删除合同
    deleteContract: function(id) {
        return this.delete('contracts', id);
    },
    
    // 获取流转记录
    getTransferRecords: function() {
        return this.query('transfer_records', { order: { column: 'created_at', ascending: false } });
    },
    
    // 获取单条流转记录
    getTransferById: function(id) {
        return new Promise(function(resolve, reject) {
            if (!AppConfig.isReady) {
                reject(new Error('Supabase 未初始化'));
                return;
            }
            supabase.from('transfer_records').select('*').eq('id', id).then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data && result.data.length > 0 ? result.data[0] : null);
                }
            }).catch(reject);
        });
    },
    
    // 添加流转记录
    addTransferRecord: function(data) {
        return this.insert('transfer_records', data);
    },
    
    // 更新流转记录
    updateTransferRecord: function(id, data) {
        return this.update('transfer_records', id, data);
    },
    
    // 删除流转记录
    deleteTransferRecord: function(id) {
        return this.delete('transfer_records', id);
    },
    
    // 获取工作量记录
    getWorkRecords: function() {
        return this.query('work_records', { order: { column: 'created_at', ascending: false } });
    },
    
    // 获取单条工作量记录
    getWorkById: function(id) {
        return new Promise(function(resolve, reject) {
            if (!AppConfig.isReady) {
                reject(new Error('Supabase 未初始化'));
                return;
            }
            supabase.from('work_records').select('*').eq('id', id).then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data && result.data.length > 0 ? result.data[0] : null);
                }
            }).catch(reject);
        });
    },
    
    // 添加工作量记录
    addWorkRecord: function(data) {
        return this.insert('work_records', data);
    },
    
    // 更新工作量记录
    updateWorkRecord: function(id, data) {
        return this.update('work_records', id, data);
    },
    
    // 删除工作量记录
    deleteWorkRecord: function(id) {
        return this.delete('work_records', id);
    }
};

// UI工具类
var UIUtils = {
    showToast: function(message, type) {
        type = type || 'info';
        var container = document.getElementById('toast-container');
        if (!container) return;
        
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        
        var icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        
        toast.innerHTML = icons[type] + '<span>' + message + '</span>';
        container.appendChild(toast);
        
        setTimeout(function() {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    },
    
    formatDate: function(dateString) {
        var date = new Date(dateString);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    },
    
    formatDateTime: function(dateString) {
        var date = new Date(dateString);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        var hours = String(date.getHours()).padStart(2, '0');
        var minutes = String(date.getMinutes()).padStart(2, '0');
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
    },
    
    createEmptyState: function(icon, text, buttonText, onClick) {
        return '<div class="empty-state">' +
            '<div class="empty-state-icon">' + icon + '</div>' +
            '<p class="empty-state-text">' + text + '</p>' +
            (buttonText ? '<button class="btn btn-primary" onclick="' + onClick + '">' + buttonText + '</button>' : '') +
            '</div>';
    }
};

// 模态框管理器
var ModalManager = {
    isOpen: false,
    currentCallback: null,
    
    open: function(title, content, onConfirm) {
        this.isOpen = true;
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal').classList.add('show');
        this.currentCallback = onConfirm;
    },
    
    close: function() {
        this.isOpen = false;
        document.getElementById('modal').classList.remove('show');
        this.currentCallback = null;
    },
    
    confirm: function() {
        if (this.currentCallback) {
            this.currentCallback();
        }
        this.close();
    },
    
    init: function() {
        var self = this;
        document.getElementById('modal-close').addEventListener('click', function() { self.close(); });
        document.getElementById('modal-cancel').addEventListener('click', function() { self.close(); });
        document.getElementById('modal-confirm').addEventListener('click', function() { self.confirm(); });
        document.querySelector('.modal-overlay').addEventListener('click', function() { self.close(); });
    }
};

// 页面导航管理器
var PageNavigator = {
    currentPage: null,
    
    navigate: function(pageName) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(function(item) {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
        
        // 更新页面标题
        var pageConfig = AppConfig.pages[pageName];
        if (pageConfig) {
            document.getElementById('page-title').textContent = pageConfig.title;
        }
        
        // 加载页面内容
        this.loadPage(pageName);
        AppConfig.currentPage = pageName;
    },
    
    loadPage: function(pageName) {
        var content = document.getElementById('page-content');
        content.innerHTML = '<div class="fade-in"><p style="text-align: center; padding: 40px; color: #999;">加载中...</p></div>';
        
        // 根据页面类型调用对应的渲染函数
        switch (pageName) {
            case 'equipment':
                EquipmentPage.render(content);
                break;
            case 'contract':
                ContractPage.render(content);
                break;
            case 'transfer':
                TransferPage.render(content);
                break;
            case 'work':
                WorkPage.render(content);
                break;
            default:
                content.innerHTML = '<p>页面不存在</p>';
        }
    }
};

// 应用初始化
function initApp() {
    // 初始化 Supabase
    if (!StorageManager.init()) {
        console.error('Supabase 初始化失败');
        document.getElementById('page-content').innerHTML = '<div class="empty-state"><p class="empty-state-text">系统初始化失败，请刷新页面重试</p></div>';
        return;
    }
    
    // 初始化模态框
    ModalManager.init();
    
    // 初始化导航
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            var pageName = item.dataset.page;
            if (pageName) {
                PageNavigator.navigate(pageName);
            }
        });
    });
    
    // 刷新按钮
    document.getElementById('refresh-btn').addEventListener('click', function() {
        PageNavigator.loadPage(AppConfig.currentPage);
        UIUtils.showToast('数据已刷新', 'success');
    });
    
    // 新增按钮
    document.getElementById('add-btn').addEventListener('click', function() {
        switch (AppConfig.currentPage) {
            case 'equipment':
                EquipmentPage.showAddTypeModal();
                break;
            case 'contract':
                ContractPage.showAddModal();
                break;
            case 'transfer':
                TransferPage.showAddModal();
                break;
            case 'work':
                WorkPage.showAddModal();
                break;
        }
    });
    
    // 加载默认页面
    PageNavigator.navigate('equipment');
    
    console.log('桩基检测劳务管理系统已启动（Supabase云端版）');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
