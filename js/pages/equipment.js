/**
 * 劳务设备管理模块 - 本地存储版
 */

var EquipmentPage = {
    render: function(container) {
        var data = StorageManager.getAll();
        var inventory = data.equipmentInventory || [];
        var contracts = data.contracts || [];
        
        // 计算统计数据
        var totalDevices = 0;
        inventory.forEach(function(item) {
            totalDevices += (item.totalQuantity || item.total_quantity || 0);
        });
        
        var totalTypes = inventory.length;
        var activeProjects = 0;
        contracts.forEach(function(p) {
            if (p.status === 'active') activeProjects++;
        });
        
        var distributedDevices = 0;
        inventory.forEach(function(item) {
            var quantities = item.projectQuantities || item.project_quantities || {};
            Object.keys(quantities).forEach(function(key) {
                distributedDevices += quantities[key];
            });
        });
        
        var html = '';
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-card-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg></div><div class="stat-card-value">' + totalDevices + '</div><div class="stat-card-label">设备总数</div></div>';
        html += '<div class="stat-card"><div class="stat-card-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div class="stat-card-value">' + totalTypes + '</div><div class="stat-card-label">设备类型</div></div>';
        html += '<div class="stat-card"><div class="stat-card-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><div class="stat-card-value">' + activeProjects + '</div><div class="stat-card-label">活跃项目</div></div>';
        html += '<div class="stat-card"><div class="stat-card-icon red"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div><div class="stat-card-value">' + distributedDevices + '</div><div class="stat-card-label">已分配设备</div></div>';
        html += '</div>';
        
        // 设备列表
        html += '<div class="card"><div class="card-header"><h3 class="card-title">设备库存管理</h3><div style="display: flex; gap: 12px;">';
        html += '<button class="btn btn-outline" onclick="EquipmentPage.showAddTypeModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>添加类型</button>';
        html += '<button class="btn btn-outline" onclick="EquipmentPage.showAddStockModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>添加库存</button>';
        html += '</div></div><div class="card-body">';
        
        if (inventory.length === 0) {
            html += UIUtils.createEmptyState(
                '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>',
                '暂无设备类型',
                '添加设备',
                "EquipmentPage.showAddTypeModal()"
            );
        } else {
            html += '<div class="table-container"><table><thead><tr><th>设备类型</th><th>总数量</th><th>已分配</th><th>空闲</th><th>操作</th></tr></thead><tbody>';
            
            inventory.forEach(function(item) {
                var distributed = 0;
                var quantities = item.projectQuantities || item.project_quantities || {};
                Object.keys(quantities).forEach(function(key) {
                    distributed += quantities[key];
                });
                
                var available = (item.totalQuantity || item.total_quantity || 0) - distributed;
                var typeName = item.typeName || item.type_name || '未知设备';
                var id = item.id || 0;
                
                html += '<tr>';
                html += '<td><strong>' + typeName + '</strong></td>';
                html += '<td>' + (item.totalQuantity || item.total_quantity || 0) + '</td>';
                html += '<td><span class="tag tag-blue">' + distributed + '</span></td>';
                html += '<td><span class="tag tag-green">' + available + '</span></td>';
                html += '<td><div class="action-buttons">';
                html += '<button class="action-btn action-btn-edit" onclick="EquipmentPage.showDistributeModal(' + id + ', \'' + typeName + '\')">分配</button>';
                html += '<button class="action-btn action-btn-delete" onclick="EquipmentPage.deleteEquipment(' + id + ')">删除</button>';
                html += '</div></td>';
                html += '</tr>';
            });
            
            html += '</tbody></table></div>';
        }
        
        html += '</div></div>';
        
        container.innerHTML = html;
    },
    
    showAddTypeModal: function() {
        var content = '<div class="form-group"><label class="form-label required">设备类型名称</label><input type="text" class="form-input" id="equipment-type-name" placeholder="请输入设备类型名称，如：桩基检测仪"></div>';
        ModalManager.open('添加设备类型', content, function() {
            var name = document.getElementById('equipment-type-name').value.trim();
            if (!name) {
                UIUtils.showToast('请输入设备类型名称', 'warning');
                return;
            }
            
            var data = StorageManager.getAll();
            var exists = false;
            (data.equipmentInventory || []).forEach(function(item) {
                if ((item.typeName || item.type_name) === name) {
                    exists = true;
                }
            });
            
            if (exists) {
                UIUtils.showToast('该设备类型已存在', 'warning');
                return;
            }
            
            var newEquipment = {
                id: Date.now(),  // 添加id
                typeName: name,
                totalQuantity: 0,
                projectQuantities: {}
            };
            
            if (!data.equipmentInventory) data.equipmentInventory = [];
            data.equipmentInventory.push(newEquipment);
            StorageManager.save(data);
            
            UIUtils.showToast('设备类型添加成功', 'success');
            PageNavigator.loadPage('equipment');
        });
    },
    
    showAddStockModal: function() {
        var data = StorageManager.getAll();
        var equipment = data.equipmentInventory || [];
        
        if (equipment.length === 0) {
            UIUtils.showToast('请先添加设备类型', 'warning');
            return;
        }
        
        var options = '';
        equipment.forEach(function(item) {
            options += '<option value="' + (item.id || 0) + '">' + (item.typeName || item.type_name) + '</option>';
        });
        
        var content = '<div class="form-group"><label class="form-label required">选择设备类型</label><select class="form-select" id="stock-equipment-type">' + options + '</select></div>';
        content += '<div class="form-group"><label class="form-label required">增加数量</label><input type="number" class="form-input" id="stock-quantity" placeholder="请输入增加数量" min="1" value="0"></div>';
        
        ModalManager.open('添加设备库存', content, function() {
            var typeId = parseInt(document.getElementById('stock-equipment-type').value);
            var quantity = parseInt(document.getElementById('stock-quantity').value) || 0;
            
            if (quantity <= 0) {
                UIUtils.showToast('请输入有效的数量', 'warning');
                return;
            }
            
            var data = StorageManager.getAll();
            var found = false;
            (data.equipmentInventory || []).forEach(function(item) {
                if (item.id === typeId) {
                    item.totalQuantity = (item.totalQuantity || 0) + quantity;
                    found = true;
                }
            });
            
            if (found) {
                StorageManager.save(data);
                UIUtils.showToast('设备库存添加成功', 'success');
                PageNavigator.loadPage('equipment');
            } else {
                UIUtils.showToast('设备类型不存在', 'error');
            }
        });
    },
    
    showDistributeModal: function(id, typeName) {
        var data = StorageManager.getAll();
        var contracts = data.contracts || [];
        var equipment = null;
        (data.equipmentInventory || []).forEach(function(item) {
            if (item.id === id) equipment = item;
        });
        
        if (!equipment) {
            UIUtils.showToast('设备类型不存在', 'error');
            return;
}
        
        var currentQty = (equipment.projectQuantities || {})[contracts[0]?.id] || 0;
        
        var projectOptions = '';
        if (contracts.length === 0) {
            projectOptions = '<option value="">暂无项目，请先添加项目</option>';
        } else {
            contracts.forEach(function(p) {
                var pId = p.id || 0;
                var pName = p.name || '未知项目';
                var existingQty = (equipment.projectQuantities || {})[pId] || 0;
                projectOptions += '<option value="' + pId + '">' + pName + ' (当前: ' + existingQty + '台)</option>';
            });
        }
        
        var content = '<div style="margin-bottom: 16px; padding: 12px; background: #f5f5f5; border-radius: 6px;"><strong>设备类型：</strong>' + typeName + '<br><strong>可用总数：</strong>' + equipment.totalQuantity + '台</div>';
        content += '<div class="form-group"><label class="form-label required">选择项目</label><select class="form-select" id="distribute-project" onchange="EquipmentPage.updateDistributePreview()">' + projectOptions + '</select></div>';
        content += '<div class="form-group"><label class="form-label required">分配数量</label><input type="number" class="form-input" id="distribute-quantity" placeholder="请输入分配数量" min="1" value="1" onchange="EquipmentPage.updateDistributePreview()"></div>';
        content += '<div id="distribute-preview" style="padding: 12px; background: #e6f7ff; border-radius: 6px; margin-top: 12px;"></div>';
        
        ModalManager.open('分配设备', content, function() {
            var projectId = document.getElementById('distribute-project').value;
            var quantity = parseInt(document.getElementById('distribute-quantity').value) || 0;
            
            if (!projectId) {
                UIUtils.showToast('请选择项目', 'warning');
                return;
            }
            
            if (quantity <= 0) {
                UIUtils.showToast('请输入有效的数量', 'warning');
                return;
            }
            
            var totalAllocated = 0;
            Object.values(equipment.projectQuantities || {}).forEach(function(qty) {
                totalAllocated += qty;
            });
            
            var available = (equipment.totalQuantity || 0) - totalAllocated;
            
            if (quantity > available) {
                UIUtils.showToast('可用设备不足，当前可用 ' + available + ' 台', 'warning');
                return;
            }
            
            var currentProjectQty = (equipment.projectQuantities || {})[projectId] || 0;
            equipment.projectQuantities = equipment.projectQuantities || {};
            equipment.projectQuantities[projectId] = currentProjectQty + quantity;
            
            StorageManager.save(data);
            UIUtils.showToast('设备分配成功', 'success');
            PageNavigator.loadPage('equipment');
        });
        
        // 初始化预览
        setTimeout(function() {
            EquipmentPage.updateDistributePreview();
        }, 100);
    },
    
    updateDistributePreview: function() {
        var data = StorageManager.getAll();
        var projectId = document.getElementById('distribute-project').value;
        var quantity = parseInt(document.getElementById('distribute-quantity').value) || 0;
        var preview = document.getElementById('distribute-preview');
        
        if (!projectId || quantity <= 0) {
            preview.innerHTML = '请选择项目并输入分配数量';
            return;
        }
        
        var project = null;
        (data.contracts || []).forEach(function(p) {
            if (p.id == projectId) project = p;
        });
        
        if (!project) {
            preview.innerHTML = '项目不存在';
            return;
        }
        
        var equipment = null;
        (data.equipmentInventory || []).forEach(function(item) {
            if (item.id) {
                var qty = (item.projectQuantities || {})[projectId] || 0;
                preview.innerHTML = '<strong>' + project.name + '</strong> 将分配 <strong style="color: var(--primary-color);">' + quantity + '</strong> 台设备';
            }
        });
    },
    
    deleteEquipment: function(id) {
        if (confirm('确定要删除该设备类型吗？相关的分配记录也会被清除。')) {
            var data = StorageManager.getAll();
            var index = -1;
            (data.equipmentInventory || []).forEach(function(item, i) {
                if (item.id === id) index = i;
            });
            
            if (index !== -1) {
                data.equipmentInventory.splice(index, 1);
                StorageManager.save(data);
                UIUtils.showToast('设备类型删除成功', 'success');
                PageNavigator.loadPage('equipment');
            }
        }
    }
};
