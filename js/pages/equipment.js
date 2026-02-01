/**
 * 劳务设备管理模块 - Supabase版
 */

var EquipmentPage = {
    render: function(container) {
        container.innerHTML = '<div class="fade-in"><p style="text-align: center; padding: 40px; color: #999;">加载设备数据中...</p></div>';
        
        // 并行获取数据
        Promise.all([
            StorageManager.getEquipmentInventory(),
            StorageManager.getContracts()
        ]).then(function(results) {
            var inventory = results[0] || [];
            var projects = results[1] || [];
            
            // 计算统计数据
            var totalDevices = 0;
            inventory.forEach(function(item) {
                totalDevices += (item.total_quantity || 0);
            });
            
            var totalTypes = inventory.length;
            var activeProjects = 0;
            projects.forEach(function(p) {
                if (p.status === 'active') activeProjects++;
            });
            
            var distributedDevices = 0;
            inventory.forEach(function(item) {
                var quantities = item.project_quantities || {};
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
            html += '</div></div><div class="card-body"><div class="table-container"><table><thead><tr><th>设备类型</th><th>总数量</th><th>已分配</th><th>空闲</th><th>操作</th></tr></thead><tbody>';
            
            inventory.forEach(function(item) {
                var distributed = 0;
                var quantities = item.project_quantities || {};
                Object.keys(quantities).forEach(function(key) {
                    distributed += quantities[key];
                });
                
                var available = (item.total_quantity || 0) - distributed;
                
                html += '<tr>';
                html += '<td><strong>' + item.type_name + '</strong></td>';
                html += '<td>' + (item.total_quantity || 0) + '</td>';
                html += '<td><span class="tag tag-blue">' + distributed + '</span></td>';
                html += '<td><span class="tag tag-green">' + available + '</span></td>';
                html += '<td><div class="action-buttons">';
                html += '<button class="action-btn action-btn-edit" onclick="EquipmentPage.showDistributeModal(' + item.id + ', \'' + item.type_name + '\')">分配</button>';
                html += '<button class="action-btn action-btn-delete" onclick="EquipmentPage.deleteEquipment(' + item.id + ')">删除</button>';
                html += '</div></td>';
                html += '</tr>';
            });
            
            html += '</tbody></table></div></div></div>';
            
            container.innerHTML = html;
        }).catch(function(err) {
            container.innerHTML = '<div class="empty-state"><p class="empty-state-text">加载失败: ' + err.message + '</p></div>';
        });
    },
    
    showAddTypeModal: function() {
        var content = '<form id="equipment-type-form"><div class="form-group"><label class="form-label required">设备类型名称</label><input type="text" class="form-input" id="type-name" placeholder="请输入设备类型名称，如：吊车、货车等" required></div></form>';
        
        ModalManager.open('添加设备类型', content, function() {
            var name = document.getElementById('type-name').value.trim();
            if (!name) {
                UIUtils.showToast('请输入设备类型名称', 'warning');
                return;
            }
            
            StorageManager.insert('equipment_types', { name: name }).then(function() {
                UIUtils.showToast('设备类型添加成功', 'success');
                PageNavigator.loadPage('equipment');
            }).catch(function(err) {
                UIUtils.showToast('添加失败: ' + err.message, 'error');
            });
        });
    },
    
    showAddStockModal: function() {
        StorageManager.getEquipmentInventory().then(function(inventory) {
            var options = '<option value="">请选择设备类型</option>';
            inventory.forEach(function(item) {
                options += '<option value="' + item.id + '">' + item.type_name + '</option>';
            });
            
            var content = '<form id="equipment-stock-form"><div class="form-group"><label class="form-label required">选择设备类型</label><select class="form-select" id="stock-type" required>' + options + '</select></div>';
            content += '<div class="form-group"><label class="form-label required">添加数量</label><input type="number" class="form-input" id="stock-quantity" placeholder="请输入添加数量" min="1" required></div></form>';
            
            ModalManager.open('添加设备库存', content, function() {
                var id = parseInt(document.getElementById('stock-type').value);
                var quantity = parseInt(document.getElementById('stock-quantity').value);
                
                if (!id) {
                    UIUtils.showToast('请选择设备类型', 'warning');
                    return;
                }
                
                if (!quantity || quantity <= 0) {
                    UIUtils.showToast('请输入有效的数量', 'warning');
                    return;
                }
                
                StorageManager.getEquipmentInventory().then(function(items) {
                    var item = null;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].id === id) {
                            item = items[i];
                            break;
                        }
                    }
                    
                    if (item) {
                        var newQty = (item.total_quantity || 0) + quantity;
                        StorageManager.updateEquipmentInventory(id, { total_quantity: newQty }).then(function() {
                            UIUtils.showToast('设备库存添加成功', 'success');
                            PageNavigator.loadPage('equipment');
                        }).catch(function(err) {
                            UIUtils.showToast('更新失败: ' + err.message, 'error');
                        });
                    }
                });
            });
        });
    },
    
    showDistributeModal: function(id, typeName) {
        StorageManager.getContracts().then(function(projects) {
            var projectOptions = '<option value="">请选择目标项目</option>';
            projects.forEach(function(p) {
                projectOptions += '<option value="' + p.id + '">' + p.name + '</option>';
            });
            
            var content = '<div class="form-group"><label class="form-label required">选择项目</label><select class="form-select" id="distribute-project" required>' + projectOptions + '</select></div>';
            content += '<div class="form-group"><label class="form-label required">分配数量</label><input type="number" class="form-input" id="distribute-quantity" placeholder="请输入分配数量" min="1" required></div>';
            
            ModalManager.open('分配设备 - ' + typeName, content, function() {
                var projectId = document.getElementById('distribute-project').value;
                var quantity = parseInt(document.getElementById('distribute-quantity').value);
                
                if (!projectId) {
                    UIUtils.showToast('请选择目标项目', 'warning');
                    return;
                }
                
                if (!quantity || quantity <= 0) {
                    UIUtils.showToast('请输入有效的数量', 'warning');
                    return;
                }
                
                StorageManager.getEquipmentInventory().then(function(items) {
                    var item = null;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].id === id) {
                            item = items[i];
                            break;
                        }
                    }
                    
                    if (item) {
                        var quantities = item.project_quantities || {};
                        var current = quantities[projectId] || 0;
                        quantities[projectId] = current + quantity;
                        
                        StorageManager.updateEquipmentInventory(id, { project_quantities: quantities }).then(function() {
                            UIUtils.showToast('设备分配成功', 'success');
                            PageNavigator.loadPage('equipment');
                        }).catch(function(err) {
                            UIUtils.showToast('分配失败: ' + err.message, 'error');
                        });
                    }
                });
            });
        });
    },
    
    deleteEquipment: function(id) {
        if (confirm('确定要删除该设备类型吗？')) {
            StorageManager.delete('equipment_types', id).then(function() {
                UIUtils.showToast('设备类型删除成功', 'success');
                PageNavigator.loadPage('equipment');
            }).catch(function(err) {
                UIUtils.showToast('删除失败: ' + err.message, 'error');
            });
        }
    }
};
