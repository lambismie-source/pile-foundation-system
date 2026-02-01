/**
 * 项目管理模块 - 本地存储版
 */

var ContractPage = {
    render: function(container) {
        var data = StorageManager.getAll();
        var contracts = data.contracts || [];
        
        var html = '';
        
        // 统计
        var totalContracts = contracts.length;
        var activeContracts = 0;
        contracts.forEach(function(c) {
            if (c.status === 'active') activeContracts++;
        });
        
        var totalPrices = 0;
        contracts.forEach(function(c) {
            if (c.prices && Array.isArray(c.prices)) {
                totalPrices += c.prices.length;
            }
        });
        
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-card-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.87"/></svg></div><div class="stat-card-value">' + totalContracts + '</div><div class="stat-card-label">项目总数</div></div>';
        html += '<div class="stat-card"><div class="stat-card-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="stat-card-value">' + activeContracts + '</div><div class="stat-card-label">进行中</div></div>';
        html += '<div class="stat-card"><div class="stat-card-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="stat-card-value">' + totalPrices + '</div><div class="stat-card-label">单价配置数</div></div>';
        html += '</div>';
        
        // 项目列表
        html += '<div class="card"><div class="card-header"><h3 class="card-title">项目管理</h3>';
        html += '<div style="display: flex; gap: 8px;">';
        html += '<button class="btn btn-secondary" onclick="ContractPage.showPriceTypesModal()" style="display: flex; align-items: center; gap: 4px;">';
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>单价类型</button>';
        html += '<button class="btn btn-primary" onclick="ContractPage.showAddModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>添加项目</button>';
        html += '</div></div><div class="card-body">';
        
        if (contracts.length === 0) {
            html += UIUtils.createEmptyState(
                '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"/></svg>',
                '暂无项目',
                '添加项目',
                "ContractPage.showAddModal()"
            );
        } else {
            html += '<div class="table-container"><table><thead><tr><th>项目名称</th><th>状态</th><th>地址</th><th>负责人</th><th>单价配置</th><th>附件</th><th>创建时间</th><th>操作</th></tr></thead><tbody>';
            
            contracts.forEach(function(contract) {
                var statusClass = contract.status === 'active' ? 'tag-green' : 'tag-gray';
                var statusText = contract.status === 'active' ? '进行中' : '已结束';
                
                var pricesCount = contract.prices && Array.isArray(contract.prices) ? contract.prices.length : 0;
                var attachmentsCount = contract.attachments && Array.isArray(contract.attachments) ? contract.attachments.length : 0;
                
                html += '<tr>';
                html += '<td><strong>' + (contract.name || '未知项目') + '</strong></td>';
                html += '<td><span class="tag ' + statusClass + '">' + statusText + '</span></td>';
                html += '<td>' + (contract.address || '-') + '</td>';
                html += '<td>' + (contract.manager || '-') + '</td>';
                html += '<td><span class="tag tag-blue">' + pricesCount + ' 项</span></td>';
                html += '<td>' + (attachmentsCount > 0 ? '<span class="tag tag-green">' + attachmentsCount + ' 个</span>' : '<span style="color: #999;">无</span>') + '</td>';
                html += '<td>' + UIUtils.formatDate(contract.createdAt) + '</td>';
                html += '<td><div class="action-buttons">';
                html += '<button class="action-btn action-btn-edit" onclick="ContractPage.editContract(' + contract.id + ')">编辑</button>';
                html += '<button class="action-btn action-btn-edit" onclick="ContractPage.showAttachmentsModal(' + contract.id + ')">附件</button>';
                html += '<button class="action-btn action-btn-delete" onclick="ContractPage.deleteContract(' + contract.id + ')">删除</button>';
                html += '</div></td>';
                html += '</tr>';
            });
            
            html += '</tbody></table></div>';
        }
        
        html += '</div></div>';
        
        container.innerHTML = html;
    },
    
    showAddModal: function() {
        var content = '';
        content += '<div class="form-row">';
        content += '<div class="form-group"><label class="form-label required">项目名称</label><input type="text" class="form-input" id="contract-name" placeholder="请输入项目名称"></div>';
        content += '<div class="form-group"><label class="form-label">状态</label><select class="form-select" id="contract-status"><option value="active">进行中</option><option value="completed">已结束</option></select></div>';
        content += '</div>';
        content += '<div class="form-group"><label class="form-label">项目地址</label><input type="text" class="form-input" id="contract-address" placeholder="请输入项目地址"></div>';
        content += '<div class="form-row">';
        content += '<div class="form-group"><label class="form-label">发包单位</label><input type="text" class="form-input" id="contract-employer" placeholder="请输入发包单位"></div>';
        content += '<div class="form-group"><label class="form-label">现场负责人</label><input type="text" class="form-input" id="contract-manager" placeholder="请输入负责人姓名"></div>';
        content += '</div>';
        content += '<div class="form-group"><label class="form-label">联系电话</label><input type="tel" class="form-input" id="contract-phone" placeholder="请输入联系电话"></div>';
        
        ModalManager.open('添加项目', content, function() {
            var name = document.getElementById('contract-name').value.trim();
            if (!name) {
                UIUtils.showToast('请输入项目名称', 'warning');
                return;
            }
            
            var data = StorageManager.getAll();
            var exists = false;
            (data.contracts || []).forEach(function(c) {
                if (c.name === name) exists = true;
            });
            
            if (exists) {
                UIUtils.showToast('该项目名称已存在', 'warning');
                return;
            }
            
            var newContract = {
                name: name,
                status: document.getElementById('contract-status').value,
                address: document.getElementById('contract-address').value.trim(),
                employer: document.getElementById('contract-employer').value.trim(),
                manager: document.getElementById('contract-manager').value.trim(),
                phone: document.getElementById('contract-phone').value.trim(),
                prices: [],
                attachments: []
            };
            
            StorageManager.add('contracts', newContract);
            UIUtils.showToast('项目添加成功', 'success');
            PageNavigator.loadPage('contract');
        });
    },
    
    editContract: function(id) {
        var contract = StorageManager.getById('contracts', id);
        if (!contract) {
            UIUtils.showToast('项目不存在', 'error');
            return;
        }
        
        var prices = contract.prices || [];
        // 从StorageManager获取单价类型
        var priceTypes = StorageManager.getAllPriceTypes();
        var priceTypeOptions = '';
        priceTypes.forEach(function(type) {
            priceTypeOptions += '<option value="' + type.name + '">' + type.name + ' (' + type.unit + ')</option>';
        });
        
        var content = '';
        content += '<div class="form-row">';
        content += '<div class="form-group"><label class="form-label required">项目名称</label><input type="text" class="form-input" id="contract-name" value="' + (contract.name || '') + '"></div>';
        content += '<div class="form-group"><label class="form-label">状态</label><select class="form-select" id="contract-status">';
        content += '<option value="active"' + (contract.status === 'active' ? ' selected' : '') + '>进行中</option>';
        content += '<option value="completed"' + (contract.status === 'completed' ? ' selected' : '') + '>已结束</option>';
        content += '</select></div>';
        content += '</div>';
        content += '<div class="form-group"><label class="form-label">项目地址</label><input type="text" class="form-input" id="contract-address" value="' + (contract.address || '') + '"></div>';
        content += '<div class="form-row">';
        content += '<div class="form-group"><label class="form-label">发包单位</label><input type="text" class="form-input" id="contract-employer" value="' + (contract.employer || '') + '"></div>';
        content += '<div class="form-group"><label class="form-label">现场负责人</label><input type="text" class="form-input" id="contract-manager" value="' + (contract.manager || '') + '"></div>';
        content += '</div>';
        content += '<div class="form-group"><label class="form-label">联系电话</label><input type="tel" class="form-input" id="contract-phone" value="' + (contract.phone || '') + '"></div>';
        
        // 单价配置区域
        content += '<div class="form-section" style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #ddd;">';
        content += '<h4 style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">';
        content += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
        content += '单价配置</h4>';
        
        // 添加单价表单
        content += '<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">';
        content += '<div class="form-row">';
        content += '<div class="form-group"><label class="form-label">单价类型</label><select class="form-select" id="price-type-edit">' + priceTypeOptions + '</select></div>';
        content += '<div class="form-group"><label class="form-label">单价（元）</label><input type="number" class="form-input" id="price-amount-edit" placeholder="请输入单价" min="0" step="0.01" value="0"></div>';
        content += '</div>';
        content += '<button class="btn btn-primary" onclick="ContractPage.addPriceInEdit(' + id + ')" style="margin-top: 8px;">添加单价</button>';
        content += '</div>';
        
        // 单价列表
        content += '<div style="margin-bottom: 16px;">';
        content += '<h5 style="margin-bottom: 12px; font-size: 14px; color: #666;">已配置单价</h5>';
        if (prices.length === 0) {
            content += '<p style="color: #999; padding: 16px; background: #fafafa; border-radius: 6px; text-align: center; font-size: 14px;">暂无单价配置，点击上方按钮添加</p>';
        } else {
            content += '<div class="table-container" style="max-height: 200px; overflow-y: auto;"><table><thead><tr><th>类型</th><th>单价</th><th>操作</th></tr></thead><tbody>';
            prices.forEach(function(price, index) {
                content += '<tr>';
                content += '<td>' + price.name + '</td>';
                content += '<td><strong style="color: var(--primary-color);">¥' + (price.unitPrice || 0).toFixed(2) + '</strong> / ' + (price.unit || '次') + '</td>';
                content += '<td><button class="action-btn action-btn-delete" onclick="ContractPage.deletePriceInEdit(' + id + ', ' + index + ')">删除</button></td>';
                content += '</tr>';
            });
            content += '</tbody></table></div>';
        }
        content += '</div>';
        content += '</div>';
        
        ModalManager.open('编辑项目', content, function() {
            var name = document.getElementById('contract-name').value.trim();
            if (!name) {
                UIUtils.showToast('请输入项目名称', 'warning');
                return;
            }
            
            StorageManager.update('contracts', id, {
                name: name,
                status: document.getElementById('contract-status').value,
                address: document.getElementById('contract-address').value.trim(),
                employer: document.getElementById('contract-employer').value.trim(),
                manager: document.getElementById('contract-manager').value.trim(),
                phone: document.getElementById('contract-phone').value.trim()
            });
            
            UIUtils.showToast('项目更新成功', 'success');
            PageNavigator.loadPage('contract');
        });
    },
    
    // 单价类型管理
    showPriceTypesModal: function() {
        var priceTypes = StorageManager.getAllPriceTypes();
        
        var html = '<div style="margin-bottom: 20px;">';
        html += '<h4 style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">';
        html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
        html += '单价类型管理</h4>';
        
        // 添加单价类型表单
        html += '<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">';
        html += '<h5 style="margin-bottom: 12px;">添加新单价类型</h5>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label class="form-label">类型名称</label><input type="text" class="form-input" id="price-type-name" placeholder="如：吊装水泥块"></div>';
        html += '<div class="form-group"><label class="form-label">单位</label><input type="text" class="form-input" id="price-type-unit" placeholder="如：块、根、次" style="width: 120px;"></div>';
        html += '</div>';
        html += '<button class="btn btn-primary" onclick="ContractPage.addPriceType()" style="margin-top: 8px;">添加类型</button>';
        html += '</div>';
        
        // 单价类型列表
        html += '<h5 style="margin-bottom: 12px; font-size: 14px; color: #666;">已配置的单价类型</h5>';
        if (priceTypes.length === 0) {
            html += '<p style="color: #999; padding: 20px; background: #fafafa; border-radius: 6px; text-align: center;">暂无单价类型</p>';
        } else {
            html += '<div class="table-container"><table><thead><tr><th>类型名称</th><th>单位</th><th>操作</th></tr></thead><tbody>';
            priceTypes.forEach(function(type) {
                html += '<tr>';
                html += '<td>' + (type.name || '-') + '</td>';
                html += '<td>' + (type.unit || '-') + '</td>';
                html += '<td><div class="action-buttons">';
                html += '<button class="action-btn action-btn-edit" onclick="ContractPage.editPriceType(' + type.id + ')">编辑</button>';
                html += '<button class="action-btn action-btn-delete" onclick="ContractPage.deletePriceType(' + type.id + ')">删除</button>';
                html += '</div></td>';
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }
        
        html += '</div>';
        
        ModalManager.open('单价类型管理', html, null);
    },
    
    // 添加单价类型
    addPriceType: function() {
        var name = document.getElementById('price-type-name').value.trim();
        var unit = document.getElementById('price-type-unit').value.trim();
        
        if (!name) {
            UIUtils.showToast('请输入类型名称', 'warning');
            return;
        }
        
        if (!unit) {
            UIUtils.showToast('请输入单位', 'warning');
            return;
        }
        
        // 检查是否已存在
        var priceTypes = StorageManager.getAllPriceTypes();
        var exists = false;
        priceTypes.forEach(function(type) {
            if (type.name === name) exists = true;
        });
        
        if (exists) {
            UIUtils.showToast('该类型名称已存在', 'warning');
            return;
        }
        
        StorageManager.addPriceType({
            name: name,
            unit: unit
        });
        
        UIUtils.showToast('单价类型添加成功', 'success');
        
        // 清空输入框
        document.getElementById('price-type-name').value = '';
        document.getElementById('price-type-unit').value = '';
        
        // 刷新弹窗
        ContractPage.showPriceTypesModal();
    },
    
    // 编辑单价类型
    editPriceType: function(id) {
        var priceType = StorageManager.getPriceTypeById(id);
        if (!priceType) {
            UIUtils.showToast('单价类型不存在', 'error');
            return;
        }
        
        var content = '';
        content += '<div class="form-row">';
        content += '<div class="form-group"><label class="form-label required">类型名称</label><input type="text" class="form-input" id="edit-price-type-name" value="' + (priceType.name || '') + '"></div>';
        content += '<div class="form-group"><label class="form-label required">单位</label><input type="text" class="form-input" id="edit-price-type-unit" value="' + (priceType.unit || '') + '" style="width: 120px;"></div>';
        content += '</div>';
        
        ModalManager.open('编辑单价类型', content, function() {
            var name = document.getElementById('edit-price-type-name').value.trim();
            var unit = document.getElementById('edit-price-type-unit').value.trim();
            
            if (!name) {
                UIUtils.showToast('请输入类型名称', 'warning');
                return;
            }
            
            if (!unit) {
                UIUtils.showToast('请输入单位', 'warning');
                return;
            }
            
            if (StorageManager.updatePriceType(id, { name: name, unit: unit })) {
                UIUtils.showToast('单价类型更新成功', 'success');
                ContractPage.showPriceTypesModal();
            } else {
                UIUtils.showToast('更新失败', 'error');
            }
        });
    },
    
    // 删除单价类型
    deletePriceType: function(id) {
        if (!confirm('确定要删除该单价类型吗？删除后已配置的单价仍会保留，但无法再添加新的该类型单价。')) return;
        
        if (StorageManager.deletePriceType(id)) {
            UIUtils.showToast('单价类型删除成功', 'success');
            ContractPage.showPriceTypesModal();
        } else {
            UIUtils.showToast('删除失败', 'error');
        }
    },
    
    showPricesModal: function(id) {
        var contract = StorageManager.getById('contracts', id);
        if (!contract) {
            UIUtils.showToast('项目不存在', 'error');
            return;
        }
        
        var prices = contract.prices || [];
        
        // 从StorageManager获取单价类型
        var priceTypes = StorageManager.getAllPriceTypes();
        
        // 单价类型选项
        var priceTypeOptions = '';
        priceTypes.forEach(function(type) {
            priceTypeOptions += '<option value="' + type.name + '">' + type.name + ' (' + type.unit + ')</option>';
        });
        
        var html = '<div style="margin-bottom: 20px;">';
        html += '<h4 style="margin-bottom: 12px;">' + contract.name + ' - 单价配置</h4>';
        
        // 添加单价表单
        html += '<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">';
        html += '<h5 style="margin-bottom: 12px;">添加新单价</h5>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label class="form-label">单价类型</label><select class="form-select" id="price-type">' + priceTypeOptions + '</select></div>';
        html += '<div class="form-group"><label class="form-label">单价（元）</label><input type="number" class="form-input" id="price-amount" placeholder="请输入单价" min="0" step="0.01" value="0"></div>';
        html += '</div>';
        html += '<button class="btn btn-primary" onclick="ContractPage.addPrice(' + id + ')" style="margin-top: 8px;">添加单价</button>';
        html += '</div>';
        
        // 单价列表
        html += '<h5 style="margin-bottom: 12px;">已配置单价</h5>';
        if (prices.length === 0) {
            html += '<p style="color: #999; padding: 20px; background: #fafafa; border-radius: 6px; text-align: center;">暂无单价配置</p>';
        } else {
            html += '<div class="table-container"><table><thead><tr><th>类型</th><th>单价</th><th>操作</th></tr></thead><tbody>';
            prices.forEach(function(price, index) {
                html += '<tr>';
                html += '<td>' + price.name + '</td>';
                html += '<td><strong style="color: var(--primary-color);">¥' + (price.unitPrice || 0).toFixed(2) + '</strong> / ' + (price.unit || '次') + '</td>';
                html += '<td><button class="action-btn action-btn-delete" onclick="ContractPage.deletePrice(' + id + ', ' + index + ')">删除</button></td>';
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }
        
        html += '</div>';
        
        ModalManager.open('单价配置', html, null);
    },
    
    addPrice: function(contractId) {
        var type = document.getElementById('price-type').value;
        var amount = parseFloat(document.getElementById('price-amount').value) || 0;
        
        if (amount <= 0) {
            UIUtils.showToast('请输入有效的单价', 'warning');
            return;
        }
        
        var contract = StorageManager.getById('contracts', contractId);
        if (!contract) {
            UIUtils.showToast('项目不存在', 'error');
            return;
        }
        
        // 检查是否已存在该类型单价
        var prices = contract.prices || [];
        var exists = false;
        prices.forEach(function(p) {
            if (p.name === type) exists = true;
        });
        
        if (exists) {
            UIUtils.showToast('该类型单价已存在', 'warning');
            return;
        }
        
        // 获取单位
        var unit = '次';
        if (type.indexOf('块') !== -1) unit = '块';
        else if (type.indexOf('根') !== -1) unit = '根';
        
        prices.push({
            name: type,
            unitPrice: amount,
            unit: unit
        });
        
        StorageManager.update('contracts', contractId, { prices: prices });
        UIUtils.showToast('单价添加成功', 'success');
        
        // 刷新弹窗
        ContractPage.showPricesModal(contractId);
    },
    
    deletePrice: function(contractId, priceIndex) {
        if (!confirm('确定要删除该单价吗？')) return;
        
        var contract = StorageManager.getById('contracts', contractId);
        if (!contract) return;
        
        var prices = contract.prices || [];
        if (priceIndex < prices.length) {
            prices.splice(priceIndex, 1);
            StorageManager.update('contracts', contractId, { prices: prices });
            UIUtils.showToast('单价删除成功', 'success');
            ContractPage.showPricesModal(contractId);
        }
    },
    
    // 在编辑项目模态框中添加单价
    addPriceInEdit: function(contractId) {
        var type = document.getElementById('price-type-edit').value;
        var amount = parseFloat(document.getElementById('price-amount-edit').value) || 0;
        
        if (amount <= 0) {
            UIUtils.showToast('请输入有效的单价', 'warning');
            return;
        }
        
        var contract = StorageManager.getById('contracts', contractId);
        if (!contract) {
            UIUtils.showToast('项目不存在', 'error');
            return;
        }
        
        // 检查是否已存在该类型单价
        var prices = contract.prices || [];
        var exists = false;
        prices.forEach(function(p) {
            if (p.name === type) exists = true;
        });
        
        if (exists) {
            UIUtils.showToast('该类型单价已存在', 'warning');
            return;
        }
        
        // 获取单位
        var unit = '次';
        if (type.indexOf('块') !== -1) unit = '块';
        else if (type.indexOf('根') !== -1) unit = '根';
        
        prices.push({
            name: type,
            unitPrice: amount,
            unit: unit
        });
        
        StorageManager.update('contracts', contractId, { prices: prices });
        UIUtils.showToast('单价添加成功', 'success');
        
        // 刷新编辑模态框
        ContractPage.editContract(contractId);
    },
    
    // 在编辑项目模态框中删除单价
    deletePriceInEdit: function(contractId, priceIndex) {
        if (!confirm('确定要删除该单价吗？')) return;
        
        var contract = StorageManager.getById('contracts', contractId);
        if (!contract) return;
        
        var prices = contract.prices || [];
        if (priceIndex < prices.length) {
            prices.splice(priceIndex, 1);
            StorageManager.update('contracts', contractId, { prices: prices });
            UIUtils.showToast('单价删除成功', 'success');
            ContractPage.editContract(contractId);
        }
    },
    
    showAttachmentsModal: function(id) {
        var contract = StorageManager.getById('contracts', id);
        if (!contract) {
            UIUtils.showToast('项目不存在', 'error');
            return;
        }
        
        var attachments = contract.attachments || [];
        
        var html = '<div style="margin-bottom: 20px;">';
        html += '<h4 style="margin-bottom: 12px;">' + contract.name + ' - 合同附件</h4>';
        
        // 上传文件
        html += '<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">';
        html += '<h5 style="margin-bottom: 12px;">上传附件</h5>';
        html += '<input type="file" id="attachment-file" style="margin-bottom: 12px;" onchange="ContractPage.checkFileSize(this)">';
        html += '<p style="font-size: 12px; color: #999; margin-bottom: 12px;">支持 PDF、Word、Excel、图片等文件，单个文件不超过 2MB</p>';
        html += '<button class="btn btn-primary" onclick="ContractPage.uploadAttachment(' + id + ')">上传文件</button>';
        html += '</div>';
        
        // 附件列表
        html += '<h5 style="margin-bottom: 12px;">已上传附件</h5>';
        if (attachments.length === 0) {
            html += '<p style="color: #999; padding: 20px; background: #fafafa; border-radius: 6px; text-align: center;">暂无附件</p>';
        } else {
            html += '<div class="table-container"><table><thead><tr><th>文件名</th><th>大小</th><th>上传时间</th><th>操作</th></tr></thead><tbody>';
            attachments.forEach(function(file, index) {
                var fileSize = ContractPage.formatFileSize(file.size || 0);
                var fileName = file.name || '未知文件';
                var uploadTime = file.uploadTime ? UIUtils.formatDateTime(file.uploadTime) : '-';
                
                html += '<tr>';
                html += '<td>' + fileName + '</td>';
                html += '<td>' + fileSize + '</td>';
                html += '<td>' + uploadTime + '</td>';
                html += '<td><div class="action-buttons">';
                html += '<button class="action-btn action-btn-edit" onclick="ContractPage.downloadAttachment(' + id + ', ' + index + ')">下载</button>';
                html += '<button class="action-btn action-btn-delete" onclick="ContractPage.deleteAttachment(' + id + ', ' + index + ')">删除</button>';
                html += '</div></td>';
                html += '</tr>';
            });
            html += '</tbody></table></div>';
        }
        
        html += '</div>';
        
        ModalManager.open('合同附件', html, null);
    },
    
    checkFileSize: function(input) {
        if (input.files && input.files[0]) {
            var file = input.files[0];
            if (file.size > 2 * 1024 * 1024) {
                UIUtils.showToast('文件大小不能超过2MB', 'warning');
                input.value = '';
            }
        }
    },
    
    uploadAttachment: function(contractId) {
        var fileInput = document.getElementById('attachment-file');
        if (!fileInput.files || !fileInput.files[0]) {
            UIUtils.showToast('请选择要上传的文件', 'warning');
            return;
        }
        
        var file = fileInput.files[0];
        
        // 检查文件大小
        if (file.size > 2 * 1024 * 1024) {
            UIUtils.showToast('文件大小不能超过2MB', 'warning');
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(e) {
            var contract = StorageManager.getById('contracts', contractId);
            if (!contract) {
                UIUtils.showToast('项目不存在', 'error');
                return;
            }
            
            var attachments = contract.attachments || [];
            
            attachments.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result, // base64编码的文件内容
                uploadTime: new Date().toISOString()
            });
            
            StorageManager.update('contracts', contractId, { attachments: attachments });
            UIUtils.showToast('文件上传成功', 'success');
            
            // 清空文件输入
            fileInput.value = '';
            
            // 刷新弹窗
            ContractPage.showAttachmentsModal(contractId);
        };
        reader.onerror = function() {
            UIUtils.showToast('文件读取失败', 'error');
        };
        reader.readAsDataURL(file);
    },
    
    downloadAttachment: function(contractId, attachmentIndex) {
        var contract = StorageManager.getById('contracts', contractId);
        if (!contract) return;
        
        var attachments = contract.attachments || [];
        if (attachmentIndex >= attachments.length) return;
        
        var file = attachments[attachmentIndex];
        if (!file.data) {
            UIUtils.showToast('文件数据不存在', 'error');
            return;
        }
        
        // 创建下载链接
        var link = document.createElement('a');
        link.href = file.data;
        link.download = file.name || '附件';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    deleteAttachment: function(contractId, attachmentIndex) {
        if (!confirm('确定要删除该附件吗？')) return;
        
        var contract = StorageManager.getById('contracts', contractId);
        if (!contract) return;
        
        var attachments = contract.attachments || [];
        if (attachmentIndex < attachments.length) {
            attachments.splice(attachmentIndex, 1);
            StorageManager.update('contracts', contractId, { attachments: attachments });
            UIUtils.showToast('附件删除成功', 'success');
            ContractPage.showAttachmentsModal(contractId);
        }
    },
    
    formatFileSize: function(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },
    
    deleteContract: function(id) {
        if (confirm('确定要删除该项目吗？相关的单价配置和附件也会被删除。')) {
            if (StorageManager.delete('contracts', id)) {
                UIUtils.showToast('项目删除成功', 'success');
                PageNavigator.loadPage('contract');
            } else {
                UIUtils.showToast('项目删除失败', 'error');
            }
        }
    }
};
