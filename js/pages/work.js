/**
 * 日常工作量登记模块 - 本地存储版
 */

var WorkPage = {
    render: function(container) {
        var data = StorageManager.getAll();
        var workRecords = data.workRecords || [];
        var contracts = data.contracts || [];
        var priceTypes = StorageManager.getAllPriceTypes();
        
        var today = new Date().toISOString().slice(0        
        var todayRecords = [];
       , 10);
 workRecords.forEach(function(r) {
            if (r.workDate === today || r.work_date === today) todayRecords.push(r);
        });
        
        // 计算吊车和货车工作量统计
        var craneTotalBlocks = 0;
        var craneTotalBeams = 0;
        todayRecords.forEach(function(r) {
            craneTotalBlocks += (r.craneBlocks || r.crane_blocks || 0);
            craneTotalBeams += (r.craneBeams || r.crane_beams || 0);
        });
        
        var truckTotalBlocks = 0;
        var truckTotalBeams = 0;
        todayRecords.forEach(function(r) {
            truckTotalBlocks += (r.truckBlocks || r.truck_blocks || 0);
            truckTotalBeams += (r.truckBeams || r.truck_beams || 0);
        });
        
        // 计算实际产值
        var todayOutputValue = 0;
        todayRecords.forEach(function(r) {
            // 基础计价
            todayOutputValue += (r.billableAmount || r.billable_amount || 0);
            // 产值工作量
            if (r.outputItems && Array.isArray(r.outputItems)) {
                r.outputItems.forEach(function(item) {
                    todayOutputValue += (item.amount || 0);
                });
            }
        });
        
        var html = '';
        
        // 今日统计
        html += '<div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">';
        html += '<div class="card-body" style="color: #fff;"><div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">';
        html += '<div><h3 style="font-size: 18px; margin-bottom: 8px; opacity: 0.9;">今日工作量统计</h3><p style="font-size: 14px; opacity: 0.8;">' + today + '</p></div>';
        html += '<div style="display: flex; gap: 40px;">';
        html += '<div style="text-align: center;"><div style="font-size: 32px; font-weight: 700;">' + todayRecords.length + '</div><div style="font-size: 14px; opacity: 0.8;">今日登记次数</div></div>';
        html += '<div style="text-align: center;"><div style="font-size: 32px; font-weight: 700;">¥' + todayOutputValue.toFixed(2) + '</div><div style="font-size: 14px; opacity: 0.8;">今日实际产值</div></div></div></div></div></div>';
        
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
        html += '<div class="form-group"><label class="form-label required">所属项目</label><select class="form-select" id="work-project" required onchange="WorkPage.onProjectChange()">' + projectOptions + '</select></div></div>';
        
        // 模块一：现场安装工作量
        html += '<div style="margin-top: 24px; padding: 20px; background: #f5f5f5; border-radius: 8px;">';
        html += '<h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--primary-color);">';
        html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>现场安装工作量</h4>';
        
        // 吊车工作量
        html += '<div style="margin-top: 16px;"><h5 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">';
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>吊车工作量</h5>';
        html += '<div class="form-row"><div class="form-group"><label class="form-label">吊装水泥块数量（块）</label><input type="number" class="form-input" id="crane-blocks" placeholder="请输入数量" min="0" value="0"></div>';
        html += '<div class="form-group"><label class="form-label">吊装钢梁数量（根）</label><input type="number" class="form-input" id="crane-beams" placeholder="请输入数量" min="0" value="0"></div></div></div>';
        
        // 货车工作量
        html += '<div style="margin-top: 16px;"><h5 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">';
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>货车工作量</h5>';
        html += '<div class="form-row"><div class="form-group"><label class="form-label">运输水泥块数量（块）</label><input type="number" class="form-input" id="truck-blocks" placeholder="请输入数量" min="0" value="0"></div>';
        html += '<div class="form-group"><label class="form-label">运输钢梁数量（根）</label><input type="number" class="form-input" id="truck-beams" placeholder="请输入数量" min="0" value="0"></div></div></div>';
        html += '</div>';
        
        // 模块二：当天产值工作量记录
        html += '<div style="margin-top: 24px; padding: 20px; background: #fff7e6; border-radius: 8px; border: 1px solid #ffd591;">';
        html += '<h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: #d46b08;">';
        html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>当天产值工作量记录</h4>';
        
        // 产值项目选择和添加
        html += '<div style="background: #fff; padding: 16px; border-radius: 6px; margin-bottom: 16px;">';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label class="form-label">选择单价类型</label><select class="form-select" id="output-price-type">';
        html += '<option value="">请选择单价类型</option>';
        priceTypes.forEach(function(type) {
            html += '<option value="' + type.name + '" data-unit="' + type.unit + '">' + type.name + ' (' + type.unit + ')</option>';
        });
        html += '</select></div>';
        html += '<div class="form-group"><label class="form-label">工作量数量</label><input type="number" class="form-input" id="output-quantity" placeholder="请输入数量" min="0" value="0"></div>';
        html += '<div class="form-group" style="display: flex; align-items: flex-end;"><button type="button" class="btn btn-primary" onclick="WorkPage.addOutputItem()">添加</button></div>';
        html += '</div>';
        html += '</div>';
        
        // 已添加的产值项目列表
        html += '<div id="output-items-container">';
        html += '<p style="color: #999; text-align: center; padding: 20px; background: #fafafa; border-radius: 6px;">暂无产值工作量记录，点击上方按钮添加</p>';
        html += '</div>';
        html += '</div>';
        
        // 工作备注
        html += '<div class="form-group" style="margin-top: 24px;"><label class="form-label">工作备注</label><textarea class="form-textarea" id="work-remark" placeholder="请输入工作备注（选填）" rows="3"></textarea></div>';
        
        // 基础计价金额（用于吊车和货车的产值计算）
        html += '<input type="hidden" id="billable-amount" value="0">';
        
        html += '<div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;"><button type="button" class="btn btn-outline" onclick="WorkPage.resetForm()">重置</button><button type="submit" class="btn btn-primary">提交登记</button></div>';
        html += '</form></div></div>';
        
        // 今日工作量统计
        html += '<div class="work-stats" style="margin-top: 24px;">';
        html += '<div class="work-card"><div class="work-card-header"><div class="work-card-icon" style="background: rgba(24, 144, 255, 0.1); color: var(--primary-color);">';
        html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg></div><span class="work-card-title">现场安装工作量</span></div>';
        html += '<div class="work-stats-grid">';
        html += '<div class="work-stat-item"><div class="work-stat-value" style="color: var(--primary-color);">' + craneTotalBlocks + '</div><div class="work-stat-label">吊装水泥块（块）</div></div>';
        html += '<div class="work-stat-item"><div class="work-stat-value" style="color: var(--success-color);">' + craneTotalBeams + '</div><div class="work-stat-label">吊装钢梁（根）</div></div>';
        html += '<div class="work-stat-item"><div class="work-stat-value" style="color: #13c2c2;">' + truckTotalBlocks + '</div><div class="work-stat-label">运输水泥块（块）</div></div>';
        html += '<div class="work-stat-item"><div class="work-stat-value" style="color: #722ed1;">' + truckTotalBeams + '</div><div class="work-stat-label">运输钢梁（根）</div></div>';
        html += '</div></div></div>';
        
        // 历史记录
        html += '<div class="card" style="margin-top: 24px;"><div class="card-header"><h3 class="card-title">工作量记录</h3></div><div class="card-body">';
        
        if (workRecords.length === 0) {
            html += UIUtils.createEmptyState(
                '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
                '暂无工作量记录',
                '添加记录',
                "WorkPage.scrollToForm()"
            );
        } else {
            html += '<div class="table-container"><table><thead><tr><th>日期</th><th>项目</th><th>现场安装工作量</th><th>产值工作量</th><th>产值合计</th><th>登记时间</th><th>操作</th></tr></thead><tbody id="work-table-body">';
            html += this.renderWorkTable(workRecords, contracts);
            html += '</tbody></table></div>';
        }
        
        html += '</div></div>';
        
        container.innerHTML = html;
    },
    
    // 当前添加的产值项目
    currentOutputItems: [],
    
    // 项目变更时刷新单价类型选项
    onProjectChange: function() {
        var projectId = document.getElementById('work-project').value;
        if (!projectId) return;
        
        var contract = StorageManager.getById('contracts', projectId);
        if (!contract || !contract.prices || contract.prices.length === 0) return;
        
        // 更新单价类型下拉框，只显示该项目已配置的单价
        var select = document.getElementById('output-price-type');
        if (!select) return;
        
        var priceNames = [];
        contract.prices.forEach(function(p) {
            priceNames.push(p.name);
        });
        
        // 禁用不在项目单价中的选项
        for (var i = 0; i < select.options.length; i++) {
            var option = select.options[i];
            if (option.value === '') continue;
            select.options[i].disabled = priceNames.indexOf(option.value) === -1;
        }
    },
    
    // 添加产值项目
    addOutputItem: function() {
        var select = document.getElementById('output-price-type');
        var quantity = parseFloat(document.getElementById('output-quantity').value) || 0;
        var projectId = document.getElementById('work-project').value;
        
        if (!projectId) {
            UIUtils.showToast('请先选择项目', 'warning');
            return;
        }
        
        if (!select.value) {
            UIUtils.showToast('请选择单价类型', 'warning');
            return;
        }
        
        if (quantity <= 0) {
            UIUtils.showToast('请输入有效的数量', 'warning');
            return;
        }
        
        var contract = StorageManager.getById('contracts', projectId);
        if (!contract || !contract.prices) {
            UIUtils.showToast('项目不存在', 'error');
            return;
        }
        
        // 查找单价
        var price = null;
        contract.prices.forEach(function(p) {
            if (p.name === select.value) price = p;
        });
        
        if (!price) {
            UIUtils.showToast('该项目未配置该单价类型', 'warning');
return;
        }
        
        var amount = quantity * (price.unitPrice || 0);
        
        // 检查是否已添加
        var exists = false;
        this.currentOutputItems.forEach(function(item) {
            if (item.name === select.value) exists = true;
        });
        
        if (exists) {
            UIUtils.showToast('该单价类型已添加', 'warning');
            return;
        }
        
        this.currentOutputItems.push({
            name: select.value,
            unit: select.options[select.selectedIndex].dataset.unit || '次',
            quantity: quantity,
            unitPrice: price.unitPrice || 0,
            amount: amount
        });
        
        // 清空输入
        select.value = '';
        document.getElementById('output-quantity').value = '0';
        
        // 刷新列表
        this.renderOutputItems();
        UIUtils.showToast('添加成功', 'success');
    },
    
    // 渲染产值项目列表
    renderOutputItems: function() {
        var container = document.getElementById('output-items-container');
        if (!container) return;
        
        if (this.currentOutputItems.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px; background: #fafafa; border-radius: 6px;">暂无产值工作量记录，点击上方按钮添加</p>';
            return;
        }
        
        var html = '<div class="table-container"><table><thead><tr><th>单价类型</th><th>数量</th><th>单价</th><th>金额</th><th>操作</th></tr></thead><tbody>';
        
        var total = 0;
        this.currentOutputItems.forEach(function(item, index) {
            total += item.amount;
            html += '<tr>';
            html += '<td>' + item.name + '</td>';
            html += '<td>' + item.quantity + ' ' + item.unit + '</td>';
            html += '<td>¥' + item.unitPrice.toFixed(2) + '/' + item.unit + '</td>';
            html += '<td><strong style="color: var(--primary-color);">¥' + item.amount.toFixed(2) + '</strong></td>';
            html += '<td><button type="button" class="action-btn action-btn-delete" onclick="WorkPage.removeOutputItem(' + index + ')">删除</button></td>';
            html += '</tr>';
        });
        
        html += '<tr style="background: #f5f5f5; font-weight: 600;">';
        html += '<td colspan="3" style="text-align: right;">产值合计：</td>';
        html += '<td colspan="2"><strong style="color: var(--success-color); font-size: 18px;">¥' + total.toFixed(2) + '</strong></td>';
        html += '</tr>';
        html += '</tbody></table></div>';
        
        container.innerHTML = html;
    },
    
    // 删除产值项目
    removeOutputItem: function(index) {
        if (index >= 0 && index < this.currentOutputItems.length) {
            this.currentOutputItems.splice(index, 1);
            this.renderOutputItems();
            UIUtils.showToast('已删除', 'success');
        }
    },
    
    renderWorkTable: function(records, contracts) {
        var projectsMap = {};
        contracts.forEach(function(p) {
            projectsMap[p.id] = p.name;
        });
        
        var html = '';
        records.forEach(function(record) {
            var projectName = projectsMap[record.project] || '未知项目';
            var craneBlocks = record.craneBlocks || record.crane_blocks || 0;
            var craneBeams = record.craneBeams || record.crane_beams || 0;
            var truckBlocks = record.truckBlocks || record.truck_blocks || 0;
            var truckBeams = record.truckBeams || record.truck_beams || 0;
            
            var craneSummary = '水泥块' + craneBlocks + '块 / 钢梁' + craneBeams + '根';
            var truckSummary = '水泥块' + truckBlocks + '块 / 钢梁' + truckBeams + '根';
            
            var craneTotal = craneBlocks + craneBeams;
            var truckTotal = truckBlocks + truckBeams;
            
            // 计算产值工作量
            var outputItemsHtml = '';
            var outputTotal = record.billableAmount || record.billable_amount || 0;
            if (record.outputItems && Array.isArray(record.outputItems) && record.outputItems.length > 0) {
                outputItemsHtml = '<div style="font-size: 12px; color: #666;">';
                record.outputItems.forEach(function(item) {
                    outputItemsHtml += '<div>' + item.name + ': ' + item.quantity + ' ' + item.unit + ' (¥' + item.amount.toFixed(2) + ')</div>';
                    outputTotal += item.amount;
                });
                outputItemsHtml += '</div>';
            } else {
                outputItemsHtml = '<span style="color: #999;">无</span>';
            }
            
            html += '<tr>';
            html += '<td>' + (record.workDate || record.work_date) + '</td>';
            html += '<td><strong>' + projectName + '</strong></td>';
            html += '<td><span class="tag tag-blue" title="' + craneSummary + '">' + craneTotal + ' 项</span><span class="tag tag-green" style="margin-left: 4px;" title="' + truckSummary + '">' + truckTotal + ' 项</span></td>';
            html += '<td>' + outputItemsHtml + '</td>';
            html += '<td><strong style="color: var(--success-color); font-size: 16px;">¥' + outputTotal.toFixed(2) + '</strong></td>';
            html += '<td>' + UIUtils.formatDateTime(record.createdAt) + '</td>';
            html += '<td><div class="action-buttons"><button class="action-btn action-btn-edit" onclick="WorkPage.editWork(' + record.id + ')">编辑</button>';
            html += '<button class="action-btn action-btn-delete" onclick="WorkPage.deleteWork(' + record.id + ')">删除</button></div></td>';
            html += '</tr>';
        });
        
        return html;
    },
    
    submitWork: function(event) {
        event.preventDefault();
        
        var workDate = document.getElementById('work-date').value;
        var project = document.getElementById('work-project').value;
        var craneBlocks = parseInt(document.getElementById('crane-blocks').value) || 0;
        var craneBeams = parseInt(document.getElementById('crane-beams').value) || 0;
        var truckBlocks = parseInt(document.getElementById('truck-blocks').value) || 0;
        var truckBeams = parseInt(document.getElementById('truck-beams').value) || 0;
        var remark = document.getElementById('work-remark').value.trim();
        
        if (!project) {
            UIUtils.showToast('请选择项目', 'warning');
            return;
        }
        
        var workData = {
            workDate: workDate,
            project: project,
            craneBlocks: craneBlocks,
            craneBeams: craneBeams,
            truckBlocks: truckBlocks,
            truckBeams: truckBeams,
            outputItems: this.currentOutputItems,
            remark: remark
        };
        
        StorageManager.add('workRecords', workData);
        UIUtils.showToast('工作量登记成功', 'success');
        this.resetForm();
        PageNavigator.loadPage('work');
    },
    
    editWork: function(id) {
        var record = StorageManager.getById('workRecords', id);
        if (!record) return;
        
        document.getElementById('work-date').value = record.workDate || record.work_date;
        document.getElementById('work-project').value = record.project;
        document.getElementById('crane-blocks').value = record.craneBlocks || record.crane_blocks || 0;
        document.getElementById('crane-beams').value = record.craneBeams || record.crane_beams || 0;
        document.getElementById('truck-blocks').value = record.truckBlocks || record.truck_blocks || 0;
        document.getElementById('truck-beams').value = record.truckBeams || record.truck_beams || 0;
        document.getElementById('work-remark').value = record.remark || '';
        
        // 加载产值项目
        this.currentOutputItems = record.outputItems || [];
        this.renderOutputItems();
        
        this.scrollToForm();
        
        document.getElementById('work-form').onsubmit = function(e) {
            e.preventDefault();
            WorkPage.updateWork(id);
        };
        
        UIUtils.showToast('请修改表单后重新提交', 'info');
    },
    
    updateWork: function(id) {
        var workDate = document.getElementById('work-date').value;
        var project = document.getElementById('work-project').value;
        var craneBlocks = parseInt(document.getElementById('crane-blocks').value) || 0;
        var craneBeams = parseInt(document.getElementById('crane-beams').value) || 0;
        var truckBlocks = parseInt(document.getElementById('truck-blocks').value) || 0;
        var truckBeams = parseInt(document.getElementById('truck-beams').value) || 0;
        var remark = document.getElementById('work-remark').value.trim();
        
        StorageManager.update('workRecords', id, {
            workDate: workDate,
            project: project,
            craneBlocks: craneBlocks,
            craneBeams: craneBeams,
            truckBlocks: truckBlocks,
            truckBeams: truckBeams,
            outputItems: this.currentOutputItems,
            remark: remark
        });
        
        UIUtils.showToast('记录更新成功', 'success');
        this.resetForm();
        PageNavigator.loadPage('work');
    },
    
    deleteWork: function(id) {
        if (confirm('确定要删除该工作量记录吗？')) {
            if (StorageManager.delete('workRecords', id)) {
                UIUtils.showToast('记录删除成功', 'success');
                PageNavigator.loadPage('work');
            }
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
        
        // 重置产值项目
        this.currentOutputItems = [];
        this.renderOutputItems();
        
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
