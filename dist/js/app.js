/**
 * 桩基检测劳务管理系统 - 主应用框架 (localStorage本地存储版)
 */

// 应用配置
var AppConfig = {
    pages: {
        equipment: { title: '劳务设备管理' },
        contract: { title: '项目管理' },
        transfer: { title: '设备流转登记' },
        work: { title: '日常工作量登记' }
    },
    currentPage: 'equipment',
    isReady: true
};

// 存储管理器 - 基于 localStorage
var StorageManager = {
    STORAGE_KEY: 'pile_foundation_data',
    
    // 获取所有数据
    getAll: function() {
        var data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('解析数据失败:', e);
            }
        }
        // 返回初始数据结构
        return this.getInitialData();
    },
    
    // 获取初始数据结构
    getInitialData: function() {
        return {
            equipmentTypes: [],
            equipmentInventory: [],
            contracts: [],
            transferRecords: [],
            workRecords: [],
            priceTypes: [
                { id: 1, name: '吊装水泥块', unit: '块' },
                { id: 2, name: '吊装钢梁', unit: '根' },
                { id: 3, name: '运输水泥块', unit: '块' },
                { id: 4, name: '运输钢梁', unit: '根' }
            ]
        };
    },
    
    // 保存所有数据
    save: function(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },
    
    // 添加数据
    add: function(type, item) {
        var data = this.getAll();
        if (!data[type]) {
            data[type] = [];
        }
        
        // 生成ID和时间戳
        item.id = Date.now();
        item.createdAt = new Date().toISOString();
        
        data[type].push(item);
        this.save(data);
        return item;
    },
    
    // 更新数据
    update: function(type, id, updates) {
        var data = this.getAll();
        if (!data[type]) return false;
        
        for (var i = 0; i < data[type].length; i++) {
            if (data[type][i].id === id) {
                // 保留原始创建时间
                updates.createdAt = data[type][i].createdAt;
                // 更新时间戳
                updates.updatedAt = new Date().toISOString();
                
                // 合并数据
                Object.assign(data[type][i], updates);
                this.save(data);
                return true;
            }
        }
        return false;
    },
    
    // 删除数据
    delete: function(type, id) {
        var data = this.getAll();
        if (!data[type]) return false;
        
        var found = false;
        for (var i = 0; i < data[type].length; i++) {
            if (data[type][i].id === id) {
                data[type].splice(i, 1);
                found = true;
                break;
            }
        }
        
        if (found) {
            this.save(data);
        }
        return found;
    },
    
    // 根据ID获取单条数据
    getById: function(type, id) {
        var data = this.getAll();
        if (!data[type]) return null;
        
        for (var i = 0; i < data[type].length; i++) {
            if (data[type][i].id === id) {
                return data[type][i];
            }
        }
        return null;
    },
    
    // 删除记录（带库存恢复逻辑）
    deleteRecord: function(type, id) {
        return this.delete(type, id);
    },
    
    // ===== 单价类型管理 =====
    
    // 获取所有单价类型
    getAllPriceTypes: function() {
        var data = this.getAll();
        return data.priceTypes || [];
    },
    
    // 根据ID获取单价类型
    getPriceTypeById: function(id) {
        var data = this.getAll();
        if (!data.priceTypes) return null;
        
        for (var i = 0; i < data.priceTypes.length; i++) {
            if (data.priceTypes[i].id === id) {
                return data.priceTypes[i];
            }
        }
        return null;
    },
    
    // 添加单价类型
    addPriceType: function(item) {
        var data = this.getAll();
        if (!data.priceTypes) {
            data.priceTypes = [];
        }
        
        // 生成ID
        var maxId = 0;
        data.priceTypes.forEach(function(type) {
            if (type.id > maxId) maxId = type.id;
        });
        item.id = maxId + 1;
        item.createdAt = new Date().toISOString();
        
        data.priceTypes.push(item);
        this.save(data);
        return item;
    },
    
    // 更新单价类型
    updatePriceType: function(id, updates) {
        var data = this.getAll();
        if (!data.priceTypes) return false;
        
        for (var i = 0; i < data.priceTypes.length; i++) {
            if (data.priceTypes[i].id === id) {
                updates.updatedAt = new Date().toISOString();
                Object.assign(data.priceTypes[i], updates);
                this.save(data);
                return true;
            }
        }
        return false;
    },
    
    // 删除单价类型
    deletePriceType: function(id) {
        var data = this.getAll();
        if (!data.priceTypes) return false;
        
        var found = false;
        for (var i = 0; i < data.priceTypes.length; i++) {
            if (data.priceTypes[i].id === id) {
                data.priceTypes.splice(i, 1);
                found = true;
                break;
            }
        }
        
        if (found) {
            this.save(data);
        }
        return found;
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
    
    console.log('桩基检测劳务管理系统已启动（本地存储版）');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
