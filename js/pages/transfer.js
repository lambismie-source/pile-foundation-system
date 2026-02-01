/**
 * 设备流转登记模块 - Supabase云端版
 */

var TransferPage = {
    render: function(container) {
        var self = this;
        
        container.innerHTML = '<div class="fade-in"><p style="text-align: center; padding: 40px; color: #999;">加载中...</p></div>';
        
        // 并行获取所有需要的数据
        Promise.all([
            StorageManager.getContracts(),
            StorageManager.getEquipmentInventory(),
            StorageManager.getTransferRecords()
        ]).then(function(results) {
            var contracts = results[0] || [];
            var equipmentTypes = results[1] || [];
            var transfers = results[2] || [];
            
            var totalTransfers = transfers.length;
            
            var thisMonthTransfers = 0;
            var now = new Date();
            transfers.forEach(function(t) {
                var transferDate = new Date(t.created_at);
                if (transferDate.getMonth() === now.getMonth() && transferDate.getFullYear() === now.getFullYear()) {
                    thisMonthTransfers++;
                }
            });
            
            var pendingTransfers = 0;
            var completedTransfers = 0;
            transfers.forEach(function(t) {
                if (t.status === 'pending') pendingTransfers++;
                else if (t.status === 'completed') completedTransfers++;
            });
            
            var html = '';
            html += '<div class="stats-grid">';
            html += '<div class="stat-card"><div class="stat-card-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div><div class="stat-card-value">' + totalTransfers + '</div><div class="stat-card-label">流转总次数</div></div>';
            html += '<div class="stat-card"><div class="stat-card-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="stat-card-value">' + thisMonthTransfers + '</div><div class="stat-card-label">本月流转</div></div>';
            html += '<div class="stat-card"><div class="stat-card-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="stat-card-value">' + pendingTransfers + '</div><div class="stat-card-label">待完成</div></div>';
            html += '<div class="stat-card"><div class="stat-card-icon red"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="stat-card-value">' + completedTransfers + '</div><div class="stat-card-label">已完成</div></div>';
            html += '</div>';
            
            // 项目下拉选项
            var projectOptions = '<option value="">请选择起始项目</option>';
            if (contracts.length === 0) {
                projectOptions += '<option value="" disabled>暂无项目，请先添加项目</option>';
            } else {
                contracts.forEach(function(p) {
                    projectOptions += '<option value="' + p.id + '">' + p.name + '</option>';
                });
            }
            
            var projectOptionsTarget = '<option value="">请选择目标项目</option>';
            if (contracts.length === 0) {
                projectOptionsTarget += '<option value="" disabled>暂无项目，请先添加项目</option>';
            } else {
                contracts.forEach(function(p) {
                    projectOptionsTarget += '<option value="' + p.id + '">' + p.name + '</option>';
                });
            }
            
            // 设备类型选项
            var equipmentOptions = '<option value="">请选择设备类型</option>';
            equipmentTypes.forEach(function(item) {
                equipmentOptions += '<option value="' + item.type_id + '">' + item.type_name + '</option>';
            });
            
            // 流转登记表单
            html += '<div class="card"><div class="card-header"><h3 class="card-title">新增流转登记</h3></div><div class="card-body">';
            html += '<form id="transfer-form" onsubmit="TransferPage.submitTransfer(event)">';
            html += '<div class="form-row"><div class="form-group"><label class="form-label required">起始项目</label><select class="form-select" id="transfer-from-project" required onchange="TransferPage.updateAvailableDevices()">' + projectOptions + '</select></div>';
            html += '<div class="form-group"><label class="form-label required">目标项目</label><select class="form-select" id="transfer-to-project" required>' + projectOptionsTarget + '</select></div></div>';
            html += '<div class="form-row"><div class="form-group"><label class="form-label required">设备类型</label><select class="form-select" id="transfer-equipment-type" required onchange="TransferPage.updateAvailableDevices()">' + equipmentOptions + '</select></div>';
            html += '<div class="form-group"><label class="form-label required">设备数量</label><input type="number" class="form-input" id="transfer-quantity" placeholder="请输入流转数量" min="1" required onchange="TransferPage.updateAvailableDevices()"></div></div>';
            html += '<div class="form-group"><label class="form-label">可用设备数量</label><div id="available-devices" style="padding: 12px; background: #f5f5f5; border-radius: 6px; color: #666;">请先选择起始项目和设备类型</div></div>';
            html += '<div class="form-group"><label class="form-label">流转说明</label><textarea class="form-textarea" id="transfer-remark" placeholder="请输入流转说明（选填）" rows="3"></textarea></div>';
            html += '<div style="display: flex; gap: 12px; justify-content: flex-end;"><button type="button" class="btn btn-outline" onclick="TransferPage.resetForm()">重置</button><button type="submit" class="btn btn-primary">提交流转登记</button></div>';
            html += '</form></div></div>';
            
            // 流转记录列表
            html += '<div class="card"><div class="card-header"><h3 class="card-title">流转记录</h3>';
            html += '<div class="search-bar" style="margin: 0; min-width: auto;"><div class="search-input">';
            html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
            html += '<input type="text" id="transfer-search" placeholder="搜索流转记录..." oninput="TransferPage.handleSearch()"></div></div></div>';
            html += '<div class="card-body">';
            
            if (transfers.length === 0) {
                html += UIUtils.createEmptyState(
                    '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
                    '暂无流转记录',
                    '添加流转',
                    "TransferPage.showAddModal()"
                );
            } else {
                html += '<div class="table-container"><table><thead><tr><th>流转编号</th><th>起始项目</th><th>目标项目</th><th>设备类型</th><th>数量</th><th>状态</th><th>登记时间</th><th>操作</th></tr></thead><tbody id="transfer-table-body">';
                html += self.renderTransferTable(transfers, contracts, equipmentTypes);
                html += '</tbody></table></div>';
            }
            
            html += '</div></div>';
            
            container.innerHTML = html;
        }).catch(function(error) {
            console.error('加载流转数据失败:', error);
            container.innerHTML = '<div class="empty-state"><p class="empty-state-text">加载数据失败，请刷新重试</p></div>';
        });
    },
    
    renderTransferTable: function(transfers, contracts, equipmentTypes) {
        // 构建项目映射
        var projectsMap = {};
        contracts.forEach(function(p) {
            projectsMap[p.id] = p.name;
        });
        
        // 构建设备类型映射
        var equipmentMap = {};
        equipmentTypes.forEach(function(e) {
            equipmentMap[e.type_id] = e.type_name;
        });
        
        var html = '';
        transfers.forEach(function(transfer) {
            var fromProject = projectsMap[transfer.from_project] || '未知项目';
            var toProject = projectsMap[transfer.to_project] || '未知项目';
            var equipmentName = equipmentMap[transfer.equipment_type] || '未知设备';
            
            var statusClass = 'tag-blue';
            var statusText = '进行中';
            if (transfer.status === 'completed') {
                statusClass = 'tag-green';
                statusText = '已完成';
            } else if (transfer.status === 'pending') {
                statusClass = 'tag-orange';
                statusText = '待完成';
            }
            
            html += '<tr>';
            html += '<td><code>' + transfer.transfer_no + '</code></td>';
            html += '<td>' + fromProject + '</td>';
            html += '<td>' + toProject + '</td>';
            html += '<td>' + equipmentName + '</td>';
            html += '<td><span class="tag tag-blue">' + transfer.quantity + '</span></td>';
            html += '<td><span class="tag ' + statusClass + '">' + statusText + '</span></td>';
            html += '<td>' + UIUtils.formatDateTime(transfer.created_at) + '</td>';
            html += '<td><div class="action-buttons">';
            
            if (transfer.status === 'pending') {
                html += '<button class="action-btn action-btn-edit" onclick="TransferPage.completeTransfer(' + transfer.id + ')">完成</button>';
            }
            
            html += '<button class="action-btn action-btn-delete" onclick="TransferPage.deleteTransfer(' + transfer.id + ')">删除</button></div></td>';
            html += '</tr>';
        });
        
        return html;
    },
    
    handleSearch: function() {
        var keyword = document.getElementById('transfer-search').value.toLowerCase();
        
        // 获取所有数据进行筛选
        Promise.all([
            StorageManager.getContracts(),
            StorageManager.getEquipmentInventory(),
            StorageManager.getTransferRecords()
        ]).then(function(results) {
            var contracts = results[0] || [];
            var equipmentTypes = results[1] || [];
            var transfers = results[2] || [];
            
            // 构建项目映射
            var projectsMap = {};
            contracts.forEach(function(p) {
                projectsMap[p.id] = p.name;
            });
            
            var filtered = transfers.filter(function(t) {
                var fromProject = projectsMap[t.from_project] || '';
                var toProject = projectsMap[t.to_project] || '';
                return fromProject.toLowerCase().indexOf(keyword) !== -1 ||
                       toProject.toLowerCase().indexOf(keyword) !== -1 ||
                       (t.transfer_no && t.transfer_no.toLowerCase().indexOf(keyword) !== -1);
            });
            
            document.getElementById('transfer-table-body').innerHTML = this.renderTransferTable(filtered, contracts, equipmentTypes);
        }.bind(this)).catch(function(error) {
            console.error('搜索失败:', error);
        });
    },
    
    updateAvailableDevices: function() {
        var fromProject = document.getElementById('transfer-from-project').value;
        var equipmentType = document.getElementById('transfer-equipment-type').value;
        var availableDiv = document.getElementById('available-devices');
        
        if (!fromProject || !equipmentType) {
            availableDiv.innerHTML = '请先选择起始项目和设备类型';
            return;
        }
        
        Promise.all([
            StorageManager.getEquipmentInventory(),
            StorageManager.getTransferRecords()
        ]).then(function(results) {
            var inventoryList = results[0] || [];
            var transfers = results[1] || [];
            
            var inventoryItem = null;
            for (var i = 0; i < inventoryList.length; i++) {
                if (inventoryList[i].type_id === parseInt(equipmentType)) {
                    inventoryItem = inventoryList[i];
                    break;
                }
            }
            
            if (inventoryItem) {
                var projectQuantities = inventoryItem.project_quantities || {};
                var projectQuantity = projectQuantities[fromProject] || 0;
                
                var pendingTransfers = 0;
                transfers.forEach(function(t) {
                    if (t.from_project === fromProject &&
                        t.equipment_type === parseInt(equipmentType) &&
                        t.status === 'pending') {
                        pendingTransfers += t.quantity;
                    }
                });
                
                var available = projectQuantity - pendingTransfers;
                
                if (available > 0) {
                    availableDiv.innerHTML = '<div style="display: flex; align-items: center; gap: 16px;"><span>该项目可用设备：<strong style="color: var(--success-color); font-size: 18px;">' + available + '</strong> 台</strong></span><span style="color: #999; font-size: 12px;">（已分配' + projectQuantity + '台，流转中' + pendingTransfers + '台）</span></div>';
                } else {
                    availableDiv.innerHTML = '<span style="color: var(--danger-color);">该项目无可用设备（已分配' + projectQuantity + '台，流转中' + pendingTransfers + '台）</span>';
                }
            }
        }).catch(function(error) {
            console.error('获取设备信息失败:', error);
        });
    },
    
    submitTransfer: function(event) {
        event.preventDefault();
        
        var fromProject = document.getElementById('transfer-from-project').value;
        var toProject = document.getElementById('transfer-to-project').value;
        var equipmentType = parseInt(document.getElementById('transfer-equipment-type').value);
        var quantity = parseInt(document.getElementById('transfer-quantity').value);
        var remark = document.getElementById('transfer-remark').value.trim();
        
        if (fromProject === toProject) {
            UIUtils.showToast('起始项目和目标项目不能相同', 'warning');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            UIUtils.showToast('请输入有效的流转数量', 'warning');
            return;
        }
        
        var self = this;
        
        // 验证可用数量
        Promise.all([
            StorageManager.getEquipmentInventory(),
            StorageManager.getTransferRecords()
        ]).then(function(results) {
            var inventoryList = results[0] || [];
            var transfers = results[1] || [];
            
            var inventoryItem = null;
            for (var i = 0; i < inventoryList.length; i++) {
                if (inventoryList[i].type_id === equipmentType) {
                    inventoryItem = inventoryList[i];
                    break;
                }
            }
            
            if (!inventoryItem) {
                UIUtils.showToast('设备类型不存在', 'error');
                return;
            }
            
            var projectQuantities = inventoryItem.project_quantities || {};
            var projectQuantity = projectQuantities[fromProject] || 0;
            
            var pendingTransfers = 0;
            transfers.forEach(function(t) {
                if (t.from_project === fromProject &&
                    t.equipment_type === equipmentType &&
                    t.status === 'pending') {
                    pendingTransfers += t.quantity;
                }
            });
            
            var available = projectQuantity - pendingTransfers;
            if (quantity > available) {
                UIUtils.showToast('可用设备不足，当前可用 ' + available + ' 台', 'warning');
                return;
            }
            
            // 生成流转编号
            var dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            var transferNo = 'LZ' + dateStr + '-' + String(transfers.length + 1).padStart(4, '0');
            
            var transferData = {
                transfer_no: transferNo,
                from_project: fromProject,
                to_project: toProject,
                equipment_type: equipmentType,
                quantity: quantity,
                remark: remark,
                status: 'pending'
            };
            
            StorageManager.addTransferRecord(transferData).then(function() {
                UIUtils.showToast('流转登记成功', 'success');
                self.resetForm();
                PageNavigator.loadPage('transfer');
            }).catch(function(error) {
                console.error('保存流转记录失败:', error);
                UIUtils.showToast('保存失败，请重试', 'error');
            });
        }).catch(function(error) {
            console.error('验证失败:', error);
            UIUtils.showToast('验证失败，请重试', 'error');
        });
    },
    
    completeTransfer: function(id) {
        var self = this;
        
        StorageManager.getTransferById(id).then(function(transfer) {
            if (!transfer) {
                UIUtils.showToast('流转记录不存在', 'error');
                return;
            }
            
            // 获取库存数据
            return StorageManager.getEquipmentInventory().then(function(inventoryList) {
                var fromInventory = null;
                var toInventory = null;
                
                for (var i = 0; i < inventoryList.length; i++) {
                    if (inventoryList[i].type_id === transfer.equipment_type) {
                        if (inventoryList[i].project_quantities && inventoryList[i].project_quantities[transfer.from_project] !== undefined) {
                            fromInventory = inventoryList[i];
                        }
                        if (inventoryList[i].project_quantities && inventoryList[i].project_quantities[transfer.to_project] !== undefined) {
                            toInventory = inventoryList[i];
                        }
                        if (!fromInventory || !toInventory) {
                            fromInventory = inventoryList[i];
                            toInventory = inventoryList[i];
                        }
                        break;
                    }
                }
                
                var updates = {};
                
                if (fromInventory) {
                    var currentFrom = (fromInventory.project_quantities || {})[transfer.from_project] || 0;
                    var newFrom = Math.max(0, currentFrom - transfer.quantity);
                    updates['project_quantities->' + transfer.from_project] = newFrom;
                }
                
                if (toInventory) {
                    var currentTo = (toInventory.project_quantities || {})[transfer.to_project] || 0;
                    var newTo = currentTo + transfer.quantity;
                    updates['project_quantities->' + transfer.to_project] = newTo;
                }
                
                // 更新库存
                if (fromInventory) {
                    StorageManager.updateEquipmentInventory(fromInventory.id, updates).catch(function(err) {
                        console.error('更新库存失败:', err);
                    });
                }
                
                // 更新流转记录状态
                StorageManager.updateTransferRecord(id, {
                    status: 'completed',
                    completed_at: new Date().toISOString()
                }).then(function() {
                    UIUtils.showToast('流转已完成', 'success');
                    PageNavigator.loadPage('transfer');
                }).catch(function(error) {
                    console.error('更新流转状态失败:', error);
                    UIUtils.showToast('操作失败，请重试', 'error');
                });
            });
        }).catch(function(error) {
            console.error('获取流转记录失败:', error);
            UIUtils.showToast('操作失败，请重试', 'error');
        });
    },
    
    deleteTransfer: function(id) {
        var self = this;
        
        StorageManager.getTransferById(id).then(function(transfer) {
            if (!transfer) {
                UIUtils.showToast('流转记录不存在', 'error');
                return;
            }
            
            if (transfer.status === 'completed') {
                // 如果是已完成的流转，需要恢复库存
                return StorageManager.getEquipmentInventory().then(function(inventoryList) {
                    var inventoryItem = null;
                    for (var i = 0; i < inventoryList.length; i++) {
                        if (inventoryList[i].type_id === transfer.equipment_type) {
                            inventoryItem = inventoryList[i];
                            break;
                        }
                    }
                    
                    if (inventoryItem) {
                        var updates = {};
                        
                        var currentFrom = (inventoryItem.project_quantities || {})[transfer.from_project] || 0;
                        updates['project_quantities->' + transfer.from_project] = currentFrom + transfer.quantity;
                        
                        var currentTo = (inventoryItem.project_quantities || {})[transfer.to_project] || 0;
                        updates['project_quantities->' + transfer.to_project] = Math.max(0, currentTo - transfer.quantity);
                        
                        StorageManager.updateEquipmentInventory(inventoryItem.id, updates).catch(function(err) {
                            console.error('恢复库存失败:', err);
                        });
                    }
                    
                    // 删除流转记录
                    return StorageManager.deleteTransferRecord(id);
                });
            } else {
                return StorageManager.deleteTransferRecord(id);
            }
        }).then(function() {
            UIUtils.showToast('流转记录删除成功', 'success');
            PageNavigator.loadPage('transfer');
        }).catch(function(error) {
            console.error('删除失败:', error);
            UIUtils.showToast('删除失败，请重试', 'error');
        });
    },
    
    resetForm: function() {
        document.getElementById('transfer-form').reset();
        document.getElementById('available-devices').innerHTML = '请先选择起始项目和设备类型';
    },
    
    showAddModal: function() {
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }
};
