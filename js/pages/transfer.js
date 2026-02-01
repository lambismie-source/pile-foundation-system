/**
 * 设备流转登记模块 - 本地存储版
 */

var TransferPage = {
    render: function(container) {
        var data = StorageManager.getAll();
        var transfers = data.transferRecords || [];
        var contracts = data.contracts || [];
        var equipmentTypes = data.equipmentInventory || [];
        
        var totalTransfers = transfers.length;
        
        var thisMonthTransfers = 0;
        var now = new Date();
        transfers.forEach(function(t) {
            var transferDate = new Date(t.createdAt);
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
            var typeName = item.typeName || item.type_name || '未知设备';
            equipmentOptions += '<option value="' + item.id + '">' + typeName + '</option>';
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
        html += '<div class="card"><div class="card-header"><h3 class="card-title">流转记录</h3></div><div class="card-body">';
        
        if (transfers.length === 0) {
            html += UIUtils.createEmptyState(
                '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
                '暂无流转记录',
                '添加流转',
                "TransferPage.showAddModal()"
            );
        } else {
            html += '<div class="table-container"><table><thead><tr><th>流转编号</th><th>起始项目</th><th>目标项目</th><th>设备类型</th><th>数量</th><th>状态</th><th>登记时间</th><th>操作</th></tr></thead><tbody>';
            html += this.renderTransferTable(transfers, contracts, equipmentTypes);
            html += '</tbody></table></div>';
        }
        
        html += '</div></div>';
        
        container.innerHTML = html;
    },
    
    renderTransferTable: function(transfers, contracts, equipmentTypes) {
        var projectsMap = {};
        contracts.forEach(function(p) {
            projectsMap[p.id] = p.name;
        });
        
        var equipmentMap = {};
        equipmentTypes.forEach(function(e) {
            var typeName = e.typeName || e.type_name || '未知设备';
            equipmentMap[e.id] = typeName;
        });
        
        var html = '';
        transfers.forEach(function(transfer) {
            var fromProject = projectsMap[transfer.fromProject] || '未知项目';
            var toProject = projectsMap[transfer.toProject] || '未知项目';
            var equipmentName = equipmentMap[transfer.equipmentType] || '未知设备';
            
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
            html += '<td><code>' + (transfer.transferNo || transfer.transfer_no || '未知') + '</code></td>';
            html += '<td>' + fromProject + '</td>';
            html += '<td>' + toProject + '</td>';
            html += '<td>' + equipmentName + '</td>';
            html += '<td><span class="tag tag-blue">' + transfer.quantity + '</span></td>';
            html += '<td><span class="tag ' + statusClass + '">' + statusText + '</span></td>';
            html += '<td>' + UIUtils.formatDateTime(transfer.createdAt) + '</td>';
            html += '<td><div class="action-buttons">';
            
            if (transfer.status === 'pending') {
                html += '<button class="action-btn action-btn-edit" onclick="TransferPage.completeTransfer(' + transfer.id + ')">完成</button>';
            }
            
            html += '<button class="action-btn action-btn-delete" onclick="TransferPage.deleteTransfer(' + transfer.id + ')">删除</button></div></td>';
            html += '</tr>';
        });
        
        return html;
    },
    
    updateAvailableDevices: function() {
        var fromProject = document.getElementById('transfer-from-project').value;
        var equipmentType = document.getElementById('transfer-equipment-type').value;
        var availableDiv = document.getElementById('available-devices');
        
        if (!fromProject || !equipmentType) {
            availableDiv.innerHTML = '请先选择起始项目和设备类型';
            return;
        }
        
        var data = StorageManager.getAll();
        var inventoryItem = null;
        
        for (var i = 0; i < (data.equipmentInventory || []).length; i++) {
            if ((data.equipmentInventory)[i].id === parseInt(equipmentType)) {
                inventoryItem = (data.equipmentInventory)[i];
                break;
            }
        }
        
        if (inventoryItem) {
            var projectQuantities = inventoryItem.projectQuantities || inventoryItem.project_quantities || {};
            var projectQuantity = projectQuantities[fromProject] || 0;
            
            var pendingTransfers = 0;
            (data.transferRecords || []).forEach(function(t) {
                if (t.fromProject === fromProject &&
                    t.equipmentType === parseInt(equipmentType) &&
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
        
        var data = StorageManager.getAll();
        var inventoryItem = null;
        
        for (var i = 0; i < (data.equipmentInventory || []).length; i++) {
            if ((data.equipmentInventory)[i].id === equipmentType) {
                inventoryItem = (data.equipmentInventory)[i];
                break;
            }
        }
        
        if (!inventoryItem) {
            UIUtils.showToast('设备类型不存在', 'error');
            return;
        }
        
        var projectQuantities = inventoryItem.projectQuantities || inventoryItem.project_quantities || {};
        var projectQuantity = projectQuantities[fromProject] || 0;
        
        var pendingTransfers = 0;
        (data.transferRecords || []).forEach(function(t) {
            if (t.fromProject === fromProject &&
                t.equipmentType === equipmentType &&
                t.status === 'pending') {
                pendingTransfers += t.quantity;
            }
        });
        
        var available = projectQuantity - pendingTransfers;
        if (quantity > available) {
            UIUtils.showToast('可用设备不足，当前可用 ' + available + ' 台', 'warning');
            return;
        }
        
        var dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        var transferNo = 'LZ' + dateStr + '-' + String((data.transferRecords || []).length + 1).padStart(4, '0');
        
        var transferData = {
            transferNo: transferNo,
            fromProject: fromProject,
            toProject: toProject,
            equipmentType: equipmentType,
            quantity: quantity,
            remark: remark,
            status: 'pending'
        };
        
        StorageManager.add('transferRecords', transferData);
        UIUtils.showToast('流转登记成功', 'success');
        this.resetForm();
        PageNavigator.loadPage('transfer');
    },
    
    completeTransfer: function(id) {
        var transfer = StorageManager.getById('transferRecords', id);
        if (!transfer) return;
        
        var data = StorageManager.getAll();
        
        var fromInventory = null;
        for (var i = 0; i < (data.equipmentInventory || []).length; i++) {
            if ((data.equipmentInventory)[i].id === transfer.equipmentType) {
                fromInventory = (data.equipmentInventory)[i];
                break;
            }
        }
        
        if (fromInventory) {
            var currentFrom = (fromInventory.projectQuantities || fromInventory.project_quantities || {})[transfer.fromProject] || 0;
            fromInventory.projectQuantities = fromInventory.projectQuantities || fromInventory.project_quantities || {};
            fromInventory.projectQuantities[transfer.fromProject] = Math.max(0, currentFrom - transfer.quantity);
            
            var currentTo = fromInventory.projectQuantities[transfer.toProject] || 0;
            fromInventory.projectQuantities[transfer.toProject] = currentTo + transfer.quantity;
        }
        
        StorageManager.save(data);
        
        StorageManager.update('transferRecords', id, {
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        
        UIUtils.showToast('流转已完成', 'success');
        PageNavigator.loadPage('transfer');
    },
    
    deleteTransfer: function(id) {
        if (confirm('确定要删除该流转记录吗？')) {
            if (StorageManager.delete('transferRecords', id)) {
                UIUtils.showToast('流转记录删除成功', 'success');
                PageNavigator.loadPage('transfer');
            }
        }
    },
    
    resetForm: function() {
        document.getElementById('transfer-form').reset();
        document.getElementById('available-devices').innerHTML = '请先选择起始项目和设备类型';
    },
    
    showAddModal: function() {
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }
};
