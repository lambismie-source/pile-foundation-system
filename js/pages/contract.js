/**
 * 劳务合同管理模块 - Supabase版
 */

var ContractPage = {
    render: function(container) {
        container.innerHTML = '<div class="fade-in"><p style="text-align: center; padding: 40px; color: #999;">加载项目数据中...</p></div>';
        
        StorageManager.getContracts().then(function(contracts) {
            var totalProjects = contracts.length;
            var activeProjects = 0;
            var totalAmount = 0;
            
            contracts.forEach(function(c) {
                if (c.status === 'active') activeProjects++;
                var prices = c.prices || [];
                prices.forEach(function(p) {
                    totalAmount += (p.unit_price || 0) * (p.quantity || 0);
                });
            });
            
            var html = '';
            html += '<div class="stats-grid">';
            html += '<div class="stat-card"><div class="stat-card-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div><div class="stat-card-value">' + totalProjects + '</div><div class="stat-card-label">项目总数</div></div>';
            html += '<div class="stat-card"><div class="stat-card-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg></div><div class="stat-card-value">' + activeProjects + '</div><div class="stat-card-label">进行中项目</div></div>';
            html += '<div class="stat-card"><div class="stat-card-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/></svg></div><div class="stat-card-value">¥' + (totalAmount / 10000).toFixed(2) + '万</div><div class="stat-card-label">合同总金额</div></div>';
            html += '</div>';
            
            html += '<div class="card"><div class="card-header"><h3 class="card-title">项目合同列表</h3></div><div class="card-body">';
            
            if (contracts.length === 0) {
                html += UIUtils.createEmptyState(
                    '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>',
                    '暂无项目合同数据',
                    '添加项目',
                    "ContractPage.showAddModal()"
                );
            } else {
                html += '<div class="table-container"><table><thead><tr><th>项目名称</th><th>发包单位</th><th>项目负责人</th><th>状态</th><th>操作</th></tr></thead><tbody>';
                
                contracts.forEach(function(c) {
                    html += '<tr>';
                    html += '<td><strong>' + c.name + '</strong></td>';
                    html += '<td>' + (c.employer || '-') + '</td>';
                    html += '<td>' + (c.manager || '-') + '</td>';
                    html += '<td><span class="tag ' + (c.status === 'active' ? 'tag-green' : 'tag-orange') + '">' + (c.status === 'active' ? '进行中' : '已完成') + '</span></td>';
                    html += '<td><div class="action-buttons">';
                    html += '<button class="action-btn action-btn-edit" onclick="ContractPage.viewContract(' + c.id + ')">查看</button>';
                    html += '<button class="action-btn action-btn-delete" onclick="ContractPage.deleteContract(' + c.id + ')">删除</button>';
                    html += '</div></td>';
                    html += '</tr>';
                });
                
                html += '</tbody></table></div>';
            }
            
            html += '</div></div>';
            
            container.innerHTML = html;
        }).catch(function(err) {
            container.innerHTML = '<div class="empty-state"><p class="empty-state-text">加载失败: ' + err.message + '</p></div>';
        });
    },
    
    showAddModal: function() {
        var self = this;
        
        var content = '<form id="contract-form">';
        content += '<div class="form-row"><div class="form-group"><label class="form-label required">项目名称</label><input type="text" class="form-input" id="contract-name" placeholder="请输入项目名称" required></div>';
        content += '<div class="form-group"><label class="form-label required">项目状态</label><select class="form-select" id="contract-status" required><option value="active">进行中</option><option value="completed">已完成</option></select></div></div>';
        content += '<div class="form-group"><label class="form-label">项目概况</label><textarea class="form-textarea" id="contract-overview" placeholder="请输入项目概况说明" rows="3"></textarea></div>';
        content += '<div class="form-group"><label class="form-label">项目地址</label><input type="text" class="form-input" id="contract-address" placeholder="请输入项目地址"></div>';
        content += '<div class="form-row"><div class="form-group"><label class="form-label required">发包单位</label><input type="text" class="form-input" id="contract-employer" placeholder="请输入发包单位名称" required></div>';
        content += '<div class="form-group"><label class="form-label required">项目负责人</label><input type="text" class="form-input" id="contract-manager" placeholder="请输入负责人姓名" required></div></div>';
        content += '<div class="form-group"><label class="form-label">负责人电话</label><input type="tel" class="form-input" id="contract-phone" placeholder="请输入负责人联系电话"></div></form>';
        
        ModalManager.open('添加项目', content, function() {
            self.saveContract();
        });
    },
    
    saveContract: function() {
        var name = document.getElementById('contract-name').value.trim();
        var status = document.getElementById('contract-status').value;
        var overview = document.getElementById('contract-overview').value.trim();
        var address = document.getElementById('contract-address').value.trim();
        var employer = document.getElementById('contract-employer').value.trim();
        var manager = document.getElementById('contract-manager').value.trim();
        var phone = document.getElementById('contract-phone').value.trim();
        
        if (!name) {
            UIUtils.showToast('请输入项目名称', 'warning');
            return;
        }
        
        if (!employer) {
            UIUtils.showToast('请输入发包单位', 'warning');
            return;
        }
        
        if (!manager) {
            UIUtils.showToast('请输入项目负责人', 'warning');
            return;
        }
        
        var data = {
            name: name,
            status: status,
            overview: overview,
            address: address,
            employer: employer,
            manager: manager,
            phone: phone,
            prices: [],
            attachments: []
        };
        
        StorageManager.addContract(data).then(function() {
            UIUtils.showToast('项目添加成功', 'success');
            PageNavigator.loadPage('contract');
        }).catch(function(err) {
            UIUtils.showToast('添加失败: ' + err.message, 'error');
        });
    },
    
    viewContract: function(id) {
        StorageManager.getContracts().then(function(contracts) {
            var contract = null;
            for (var i = 0; i < contracts.length; i++) {
                if (contracts[i].id === id) {
                    contract = contracts[i];
                    break;
                }
            }
            
            if (!contract) return;
            
            var content = '<div style="display: flex; flex-direction: column; gap: 16px;">';
            content += '<div><label style="font-size: 12px; color: #999;">项目名称</label><p style="font-weight: 600; margin-top: 4px;">' + contract.name + '</p></div>';
            content += '<div><label style="font-size: 12px; color: #999;">状态</label><p><span class="tag ' + (contract.status === 'active' ? 'tag-green' : 'tag-orange') + '">' + (contract.status === 'active' ? '进行中' : '已完成') + '</span></p></div>';
            if (contract.overview) content += '<div><label style="font-size: 12px; color: #999;">项目概况</label><p>' + contract.overview + '</p></div>';
            if (contract.address) content += '<div><label style="font-size: 12px; color: #999;">项目地址</label><p>' + contract.address + '</p></div>';
            content += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">';
            content += '<div><label style="font-size: 12px; color: #999;">发包单位</label><p>' + contract.employer + '</p></div>';
            content += '<div><label style="font-size: 12px; color: #999;">项目负责人</label><p>' + contract.manager + (contract.phone ? ' (' + contract.phone + ')' : '') + '</p></div>';
            content += '</div></div>';
            
            ModalManager.open('项目详情 - ' + contract.name, content, null);
        });
    },
    
    deleteContract: function(id) {
        if (confirm('确定要删除该项目吗？')) {
            StorageManager.deleteContract(id).then(function() {
                UIUtils.showToast('项目删除成功', 'success');
                PageNavigator.loadPage('contract');
            }).catch(function(err) {
                UIUtils.showToast('删除失败: ' + err.message, 'error');
            });
        }
    }
};
