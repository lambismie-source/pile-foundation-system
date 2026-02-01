/**
 * 日常工作量登记模块 - Supabase云端版
 */

var WorkPage = {
    render: function(container) {
        var self = this;
        
        container.innerHTML = '<div class="fade-in"><p style="text-align: center; padding: 40px; color: #999;">加载中...</p></div>';
        
        var today = new Date().toISOString().slice(0, 10);
        
        // 并行获取所有需要的数据
        Promise.all([
            StorageManager.getContracts(),
            StorageManager.getWorkRecords()
        ]).then(function(results) {
            var contracts = results[0] || [];
            var workRecords = results[1] || [];
            
            var todayRecords = [];
            workRecords.forEach(function(r) {
                if (r.work_date === today) todayRecords.push(r);
            });
            
            var craneTotalBlocks = 0;
            var craneTotalBeams = 0;
            todayRecords.forEach(function(r) {
                craneTotalBlocks += (r.crane_blocks || 0);
                craneTotalBeams += (r.crane_beams || 0);
            });
            
            var truckTotalBlocks = 0;
            var truckTotalBeams = 0;
            todayRecords.forEach(function(r) {
                truckTotalBlocks += (r.truck_blocks || 0);
                truckTotalBeams += (r.truck_beams || 0);
            });
            
            var todayBillable = 0;
            todayRecords.forEach(function(r) {
                todayBillable += (r.billable_amount || 0);
            });
            
            var html = '';
            
            // 今日统计
            html += '<div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">';
            html += '<div class="card-body" style="color: #fff;"><div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">';
            html += '<div><h3 style="font-size: 18px; margin-bottom: 8px; opacity: 0.9;">今日工作量统计</h3><p style="font-size: 14px; opacity: 0.8;">' + today + '</p></div>';
            html += '<div style="display: flex; gap: 40px;"><div style="text-align: center;"><div style="font-size: 32px; font-weight: 700;">' + todayRecords.length + '</div><div style="font-size: 14px; opacity: 0.8;">今日登记次数</div></div>';
            html += '<div style="text-align: center;"><div style="font-size: 32px; font-weight: 700;">¥' + todayBillable.toFixed(2) + '</div><div style="font-size: 14px; opacity: 0.8;">今日计价工作量</div></div></div></div></div></div>';
            
            // 项目选项
            var projectOptions = '<option value="">请选择项目</option>';
            if (contracts.length === 0) {
                projectOptions += '<option value="" disabled>暂无项目，请先添加项目</option>';
            } else {
                contracts.forEach(function(p) {
                    projectOptions += '<option value="' + p.id + '">' + p.name + '</option>';
                });
            }
            
            // 工作量登记表单
            html += '<div class="card"><div class="card-header"><h3 class="card-title">工作量登记</h3></div><div class="card-body">';
            html += '<form id="work-form" onsubmit="WorkPage.submitWork(event)">';
            html += '<div class="form-row"><div class="form-group"><label class="form-label required">工作日期</label><input type="date" class="form-input" id="work-date" value="' + today + '" required></div>';
            html += '<div class="form-group"><label class="form-label required">所属项目</label><select class="form-select" id="work-project" required>' + projectOptions + '</select></div></div>';
            
            // 吊车工作量
            html += '<div style="margin-top: 24px;"><h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">';
            html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>吊车工作量</h4>';
            html += '<div class="form-row"><div class="form-group"><label class="form-label">吊装水泥块数量（块）</label><input type="number" class="form-input" id="crane-blocks" placeholder="请输入数量" min="0" value="0"></div>';
            html += '<div class="form-group"><label class="form-label">吊装钢梁数量（根）</label><input type="number" class="form-input" id="crane-beams" placeholder="请输入数量" min="0" value="0"></div></div></div>';
            
            // 货车工作量
            html += '<div style="margin-top: 24px;"><h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">';
            html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>货车工作量</h4>';
            html += '<div class="form-row"><div class="form-group"><label class="form-label">运输水泥块数量（块）</label><input type="number" class="form-input" id="truck-blocks" placeholder="请输入数量" min="0" value="0"></div>';
            html += '<div class="form-group"><label class="form-label">运输钢梁数量（根）</label><input type="number" class="form-input" id="truck-beams" placeholder="请输入数量" min="0" value="0"></div></div></div>';
            
            // 当天可计价工作量
            html += '<div style="margin-top: 24px; padding: 20px; background: #f0f5ff; border-radius: 8px; border: 1px solid #91d5ff;">';
            html += '<h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--primary-color);">';
            html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>当天可计价工作量</h4>';
            html += '<div class="form-group"><label class="form-label">计价金额（元）</label><input type="number" class="form-input" id="billable-amount" placeholder="请输入可计价金额" min="0" step="0.01" value="0">';
            html += '<p style="font-size: 12px; color: #999; margin-top: 8px;">根据项目单价配置自动计算或手动输入</p></div>';
            html += '<div style="display: flex; gap: 12px; flex-wrap: wrap;">';
            html += '<button type="button" class="btn btn-outline" onclick="WorkPage.calculateBillable()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>自动计算</button>';
            html += '<button type="button" class="btn btn-outline" onclick="WorkPage.viewProjectPrices()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>查看单价</button></div></div>';
            
            html += '<div class="form-group" style="margin-top: 24px;"><label class="form-label">工作备注</label><textarea class="form-textarea" id="work-remark" placeholder="请输入工作备注（选填）" rows="3"></textarea></div>';
            html += '<div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;"><button type="button" class="btn btn-outline" onclick="WorkPage.resetForm()">重置</button><button type="submit" class="btn btn-primary">提交登记</button></div>';
            html += '</form></div></div>';
            
            // 今日工作量统计
            html += '<div class="work-stats" style="margin-top: 24px;">';
            html += '<div class="work-card"><div class="work-card-header"><div class="work-card-icon" style="background: rgba(24, 144, 255, 0.1); color: var(--primary-color);">';
            html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg></div><span class="work-card-title">吊车工作量</span></div>';
            html += '<div class="work-stats-grid"><div class="work-stat-item"><div class="work-stat-value" style="color: var(--primary-color);">' + craneTotalBlocks + '</div><div class="work-stat-label">吊装水泥块（块）</div></div>';
            html += '<div class="work-stat-item"><div class="work-stat-value" style="color: var(--success-color);">' + craneTotalBeams + '</div><div class="work-stat-label">吊装钢梁（根）</div></div></div></div>';
            
            html += '<div class="work-card"><div class="work-card-header"><div class="work-card-icon" style="background: rgba(82, 196, 26, 0.1); color: var(--success-color);">';
            html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div><span class="work-card-title">货车工作量</span></div>';
            html += '<div class="work-stats-grid"><div class="work-stat-item"><div class="work-stat-value" style="color: var(--primary-color);">' + truckTotalBlocks + '</div><div class="work-stat-label">运输水泥块（块）</div></div>';
            html += '<div class="work-stat-item"><div class="work-stat-value" style="color: var(--success-color);">' + truckTotalBeams + '</div><div class="work-stat-label">运输钢梁（根）</div></div></div></div></div>';
            
            // 历史记录
            html += '<div class="card" style="margin-top: 24px;"><div class="card-header"><h3 class="card-title">工作量记录</h3>';
            html += '<div class="search-bar" style="margin: 0; min-width: auto;"><div class="search-input">';
            html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
            html += '<input type="text" id="work-search" placeholder="搜索记录..." oninput="WorkPage.handleSearch()"></div></div></div>';
            html += '<div class="card-body">';
            
            if (workRecords.length === 0) {
                html += UIUtils.createEmptyState(
                    '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
                    '暂无工作量记录',
                    '添加记录',
                    "WorkPage.scrollToForm()"
                );
            } else {
                html += '<div class="table-container"><table><thead><tr><th>日期</th><th>项目</th><th>吊车工作量</th><th>货车工作量</th><th>计价金额</th><th>登记时间</th><th>操作</th></tr></thead><tbody id="work-table-body">';
                html += this.renderWorkTable(workRecords, contracts);
                html += '</tbody></table></div>';
            }
            
            html += '</div></div>';
            
            container.innerHTML = html;
        }).catch(function(error) {
            console.error('加载工作量数据失败:', error);
            container.innerHTML = '<div class="empty-state"><p class="empty-state-text">加载数据失败，请刷新重试</p></div>';
        });
    },
    
    renderWorkTable: function(records, contracts) {
        // 构建项目映射
        var projectsMap = {};
        contracts.forEach(function(p) {
            projectsMap[p.id] = p.name;
        });
        
        var html = '';
        records.forEach(function(record) {
            var projectName = projectsMap[record.project] || '未知项目';
            var craneSummary = '水泥块' + (record.crane_blocks || 0) + '块 / 钢梁' + (record.crane_beams || 0) + '根';
            var truckSummary = '水泥块' + (record.truck_blocks || 0) + '块 / 钢梁' + (record.truck_beams || 0) + '根';
            
            var craneTotal = (record.crane_blocks || 0) + (record.crane_beams || 0);
            var truckTotal = (record.truck_blocks || 0) + (record.truck_beams || 0);
            
            html += '<tr>';
            html += '<td>' + record.work_date + '</td>';
            html += '<td><strong>' + projectName + '</strong></td>';
            html += '<td><span class="tag tag-blue" title="' + craneSummary + '">' + craneTotal + ' 项</span></td>';
            html += '<td><span class="tag tag-green" title="' + truckSummary + '">' + truckTotal + ' 项</span></td>';
            html += '<td><span style="color: var(--success-color); font-weight: 600;">¥' + (record.billable_amount || 0).toFixed(2) + '</span></td>';
            html += '<td>' + UIUtils.formatDateTime(record.created_at) + '</td>';
            html += '<td><div class="action-buttons"><button class="action-btn action-btn-edit" onclick="WorkPage.editWork(' + record.id + ')">编辑</button>';
            html += '<button class="action-btn action-btn-delete" onclick="WorkPage.deleteWork(' + record.id + ')">删除</button></div></td>';
            html += '</tr>';
        });
        
        return html;
    },
    
    handleSearch: function() {
        var keyword = document.getElementById('work-search').value.toLowerCase();
        
        // 获取所有数据进行筛选
        Promise.all([
            StorageManager.getContracts(),
            StorageManager.getWorkRecords()
        ]).then(function(results) {
            var contracts = results[0] || [];
            var records = results[1] || [];
            
            // 构建项目映射
            var projectsMap = {};
            contracts.forEach(function(p) {
                projectsMap[p.id] = p.name;
            });
            
            var filtered = records.filter(function(r) {
                var projectName = projectsMap[r.project] || '';
                return r.work_date.indexOf(keyword) !== -1 || projectName.toLowerCase().indexOf(keyword) !== -1;
            });
            
            document.getElementById('work-table-body').innerHTML = this.renderWorkTable(filtered, contracts);
        }.bind(this)).catch(function(error) {
            console.error('搜索失败:', error);
        });
    },
    
    calculateBillable: function() {
        var projectId = document.getElementById('work-project').value;
        if (!projectId) {
            UIUtils.showToast('请先选择项目', 'warning');
            return;
        }
        
        var self = this;
        
        StorageManager.getContracts().then(function(contracts) {
            var contract = null;
            for (var i = 0; i < contracts.length; i++) {
                if (contracts[i].id == projectId) {
                    contract = contracts[i];
                    break;
                }
            }
            
            if (!contract || !contract.prices || contract.prices.length === 0) {
                UIUtils.showToast('该项目暂无单价配置，请手动输入', 'warning');
                return;
            }
            
            var craneBlocks = parseInt(document.getElementById('crane-blocks').value) || 0;
            var craneBeams = parseInt(document.getElementById('crane-beams').value) || 0;
            var truckBlocks = parseInt(document.getElementById('truck-blocks').value) || 0;
            var truckBeams = parseInt(document.getElementById('truck-beams').value) || 0;
            
            var totalAmount = 0;
            
            contract.prices.forEach(function(price) {
                var priceName = price.name.toLowerCase();
                if (priceName.indexOf('水泥块') !== -1 && priceName.indexOf('吊') !== -1) {
                    totalAmount += craneBlocks * (price.unit_price || 0);
                } else if (priceName.indexOf('钢梁') !== -1 && priceName.indexOf('吊') !== -1) {
                    totalAmount += craneBeams * (price.unit_price || 0);
                } else if (priceName.indexOf('水泥块') !== -1 && priceName.indexOf('运输') !== -1) {
                    totalAmount += truckBlocks * (price.unit_price || 0);
                } else if (priceName.indexOf('钢梁') !== -1 && priceName.indexOf('运输') !== -1) {
                    totalAmount += truckBeams * (price.unit_price || 0);
                }
            });
            
            document.getElementById('billable-amount').value = totalAmount.toFixed(2);
            UIUtils.showToast('已根据单价配置计算，金额：¥' + totalAmount.toFixed(2), 'success');
        }).catch(function(error) {
            console.error('获取项目信息失败:', error);
            UIUtils.showToast('获取项目信息失败', 'error');
        });
    },
    
    viewProjectPrices: function() {
        var projectId = document.getElementById('work-project').value;
        if (!projectId) {
            UIUtils.showToast('请先选择项目', 'warning');
            return;
        }
        
        StorageManager.getContracts().then(function(contracts) {
            var contract = null;
            for (var i = 0; i < contracts.length; i++) {
                if (contracts[i].id == projectId) {
                    contract = contracts[i];
                    break;
                }
            }
            
            if (!contract || !contract.prices || contract.prices.length === 0) {
                UIUtils.showToast('该项目暂无单价配置', 'warning');
                return;
            }
            
            var pricesHtml = '';
            contract.prices.forEach(function(p) {
                pricesHtml += '<div style="display: flex; justify-content: space-between; padding: 12px; background: #f5f5f5; border-radius: 6px; margin-bottom: 8px;">';
                pricesHtml += '<span>' + p.name + '</span>';
                pricesHtml += '<span style="color: var(--primary-color); font-weight: 600;">¥' + (p.unit_price || 0).toFixed(2) + '/' + (p.unit || '次') + '</span></div>';
            });
            
            var content = '<div><h4 style="margin-bottom: 16px;">' + contract.name + ' - 单价配置</h4>' + pricesHtml + '</div>';
            
            ModalManager.open('项目单价', content, null);
        }).catch(function(error) {
            console.error('获取项目信息失败:', error);
            UIUtils.showToast('获取项目信息失败', 'error');
        });
    },
    
    submitWork: function(event) {
        event.preventDefault();
        
        var workDate = document.getElementById('work-date').value;
        var project = document.getElementById('work-project').value;
        var craneBlocks = parseInt(document.getElementById('crane-blocks').value) || 0;
        var craneBeams = parseInt(document.getElementById('crane-beams').value) || 0;
        var truckBlocks = parseInt(document.getElementById('truck-blocks').value) || 0;
        var truckBeams = parseInt(document.getElementById('truck-beams').value) || 0;
        var billableAmount = parseFloat(document.getElementById('billable-amount').value) || 0;
        var remark = document.getElementById('work-remark').value.trim();
        
        if (!project) {
            UIUtils.showToast('请选择项目', 'warning');
            return;
        }
        
        var self = this;
        
        var workData = {
            work_date: workDate,
            project: project,
            crane_blocks: craneBlocks,
            crane_beams: craneBeams,
            truck_blocks: truckBlocks,
            truck_beams: truckBeams,
            billable_amount: billableAmount,
            remark: remark
        };
        
        StorageManager.addWorkRecord(workData).then(function() {
            UIUtils.showToast('工作量登记成功', 'success');
            self.resetForm();
            PageNavigator.loadPage('work');
        }).catch(function(error) {
            console.error('保存工作量记录失败:', error);
            UIUtils.showToast('保存失败，请重试', 'error');
        });
    },
    
    editWork: function(id) {
        var self = this;
        
        StorageManager.getWorkById(id).then(function(record) {
            if (!record) {
                UIUtils.showToast('记录不存在', 'error');
                return;
            }
            
            document.getElementById('work-date').value = record.work_date;
            document.getElementById('work-project').value = record.project;
            document.getElementById('crane-blocks').value = record.crane_blocks || 0;
            document.getElementById('crane-beams').value = record.crane_beams || 0;
            document.getElementById('truck-blocks').value = record.truck_blocks || 0;
            document.getElementById('truck-beams').value = record.truck_beams || 0;
            document.getElementById('billable-amount').value = record.billable_amount || 0;
            document.getElementById('work-remark').value = record.remark || '';
            
            self.scrollToForm();
            
            document.getElementById('work-form').onsubmit = function(e) {
                e.preventDefault();
                WorkPage.updateWork(id);
            };
            
            UIUtils.showToast('请修改表单后重新提交', 'info');
        }).catch(function(error) {
            console.error('获取记录失败:', error);
            UIUtils.showToast('获取记录失败', 'error');
        });
    },
    
    updateWork: function(id) {
        var workDate = document.getElementById('work-date').value;
        var project = document.getElementById('work-project').value;
        var craneBlocks = parseInt(document.getElementById('crane-blocks').value) || 0;
        var craneBeams = parseInt(document.getElementById('crane-beams').value) || 0;
        var truckBlocks = parseInt(document.getElementById('truck-blocks').value) || 0;
        var truckBeams = parseInt(document.getElementById('truck-beams').value) || 0;
        var billableAmount = parseFloat(document.getElementById('billable-amount').value) || 0;
        var remark = document.getElementById('work-remark').value.trim();
        
        var self = this;
        
        StorageManager.updateWorkRecord(id, {
            work_date: workDate,
            project: project,
            crane_blocks: craneBlocks,
            crane_beams: craneBeams,
            truck_blocks: truckBlocks,
            truck_beams: truckBeams,
            billable_amount: billableAmount,
            remark: remark
        }).then(function() {
            UIUtils.showToast('记录更新成功', 'success');
            self.resetForm();
            PageNavigator.loadPage('work');
        }).catch(function(error) {
            console.error('更新记录失败:', error);
            UIUtils.showToast('更新失败，请重试', 'error');
        });
    },
    
    deleteWork: function(id) {
        var self = this;
        
        if (confirm('确定要删除该工作量记录吗？')) {
            StorageManager.deleteWorkRecord(id).then(function() {
                UIUtils.showToast('记录删除成功', 'success');
                PageNavigator.loadPage('work');
            }).catch(function(error) {
                console.error('删除记录失败:', error);
                UIUtils.showToast('删除失败，请重试', 'error');
            });
        }
    },
    
    resetForm: function() {
        var today = new Date().toISOString().slice(0, 10);
        document.getElementById('work-form').reset();
        document.getElementById('work-date').value = today;
        document.getElementById('crane-blocks').value = 0;
        document.getElementById('crane-beams').value = 0;
        document.getElementById('truck-blocks').value = 0;
        document.getElementById('truck-beams').value = 0;
        document.getElementById('billable-amount').value = 0;
        
        document.getElementById('work-form').onsubmit = function(e) {
            WorkPage.submitWork(e);
        };
    },
    
    scrollToForm: function() {
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    },
    
    showAddModal: function() {
        this.scrollToForm();
    }
};
