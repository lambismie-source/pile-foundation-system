/**
 * 日常工作量登记模块 - 本地存储版
 */

var WorkPage = {
    render: function(container) {
        var data = StorageManager.getAll();
        var workRecords = data.workRecords || [];
        var contracts = data.contracts || [];
        var priceTypes = StorageManager.getAllPriceTypes();
        
        var today = new Date().toISOString().slice(0, 10);
        
        var todayRecords = [];
        workRecords.forEach(function(r) {
            if (r.workDate === today || r.work_date === today) todayRecords.push(r);
        });
        
        // 计算实际产值（包含现场安装和产值工作量）
        var todayOutputValue = 0;
        todayRecords.forEach(function(r) {
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
        html += '<p style="font-size: 12px; color: #999; margin-bottom: 16px;">填写吊车和货车的具体安装工作量</p>';
        
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
        html += '<p style="font-size: 12px; color: #999; margin-bottom: 16px;">选择单价类型、输入数量和单价，系统将自动计算产值</p>';
        
        // 产值项目输入区域（显示单价和产值）
        html += '<div id="output-items-container">';
        html += '<div class="output-item-row" style="background: #fff; padding: 16px; border-radius: 6px; margin-bottom: 12px;">';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label class="form-label">单价类型</label><select class="form-select output-price-type" name="output-price-type[]" onchange="WorkPage.calculateOutputAmount(this)">';
        html += '<option value="">请选择单价类型</option>';
        priceTypes.forEach(function(type) {
            html += '<option value="' + type.name + '" data-unit="' + type.unit + '">' + type.name + ' (' + type.unit + ')</option>';
        });
        html += '</select></div>';
        html += '<div class="form-group"><label class="form-label">数量</label><input type="number" class="form-input output-quantity" name="output-quantity[]" placeholder="数量" min="0" value="0" oninput="WorkPage.calculateOutputAmount(this)"></div>';
        html += '<div class="form-group"><label class="form-label">单价（元）</label><input type="number" class="form-input output-unit-price" name="output-unit-price[]" placeholder="单价" min="0" step="0.01" value="0" oninput="WorkPage.calculateOutputAmount(this)"></div>';
        html += '<div class="form-group"><label class="form-label">产值（元）</label><input type="text" class="form-input output-amount" name="output-amount[]" placeholder="0.00" readonly style="background: #f5f5f5; color: var(--primary-color); font-weight: 600;"></div>';
        html += '<div class="form-group" style="display: flex; align-items: flex-end;"><button type="button" class="btn btn-outline" onclick="WorkPage.addOutputRow()">+</button></div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        // 产值合计显示
        html += '<div id="output-total" style="text-align: right; padding: 12px; background: #fff; border-radius: 6px; margin-top: 12px;">';
        html += '<span style="font-size: 14px; color: #666;">产值合计：</span>';
        html += '<span style="font-size: 24px; font-weight: 700; color: var(--success-color);">¥<span id="output-total-amount">0.00</span></span>';
        html += '</div>';
        html += '</div>';
        
        // 工作备注
        html += '<div class="form-group" style="margin-top: 24px;"><label class="form-label">工作备注</label><textarea class="form-textarea" id="work-remark" placeholder="请输入工作备注（选填）" rows="3"></textarea></div>';
        
        html += '<div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;"><button type="button" class="btn btn-outline" onclick="WorkPage.resetForm()">重置</button><button type="submit" class="btn btn-primary">提交登记</button></div>';
        html += '</form></div></div>';
        
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
    
    // 项目变更时刷新单价类型选项
    onProjectChange: function() {
        var projectId = document.getElementById('work-project').value;
        if (!projectId) return;
        
        var contract = StorageManager.getById('contracts', projectId);
        if (!contract || !contract.prices || contract.prices.length === 0) return;
        
        // 更新所有单价类型下拉框，只显示该项目已配置的单价
        var selects = document.querySelectorAll('select[name="output-price-type[]"]');
        if (selects.length === 0) return;
        
        var priceNames = [];
        contract.prices.forEach(function(p) {
            priceNames.push(p.name);
        });
        
        selects.forEach(function(select) {
            for (var i = 0; i < select.options.length; i++) {
                var option = select.options[i];
                if (option.value === '') continue;
                select.options[i].disabled = priceNames.indexOf(option.value) === -1;
            }
        });
    },
    
    // 计算产值金额
    calculateOutputAmount: function(element) {
        var row = element.closest('.output-item-row');
        if (!row) return;
        
        var quantity = parseFloat(row.querySelector('.output-quantity').value) || 0;
        var unitPrice = parseFloat(row.querySelector('.output-unit-price').value) || 0;
        var amount = quantity * unitPrice;
        
        row.querySelector('.output-amount').value = amount.toFixed(2);
        
        // 更新合计
        this.updateTotalAmount();
    },
    
    // 更新产值合计
    updateTotalAmount: function() {
        var total = 0;
        var amountInputs = document.querySelectorAll('.output-amount');
        amountInputs.forEach(function(input) {
            total += parseFloat(input.value) || 0;
        });
        
        var totalSpan = document.getElementById('output-total-amount');
        if (totalSpan) {
            totalSpan.textContent = total.toFixed(2);
        }
    },
    
    // 添加产值项目行
    addOutputRow: function() {
        var container = document.getElementById('output-items-container');
        if (!container) return;
        
        var priceTypes = StorageManager.getAllPriceTypes();
        var optionsHtml = '<option value="">请选择单价类型</option>';
        priceTypes.forEach(function(type) {
            optionsHtml += '<option value="' + type.name + '" data-unit="' + type.unit + '">' + type.name + ' (' + type.unit + ')</option>';
        });
        
        var rowHtml = '<div class="output-item-row" style="background: #fff; padding: 16px; border-radius: 6px; margin-bottom: 12px;">';
        rowHtml += '<div class="form-row">';
        rowHtml += '<div class="form-group"><label class="form-label">单价类型</label><select class="form-select output-price-type" name="output-price-type[]" onchange="WorkPage.calculateOutputAmount(this)">' + optionsHtml + '</select></div>';
        rowHtml += '<div class="form-group"><label class="form-label">数量</label><input type="number" class="form-input output-quantity" name="output-quantity[]" placeholder="数量" min="0" value="0" oninput="WorkPage.calculateOutputAmount(this)"></div>';
        rowHtml += '<div class="form-group"><label class="form-label">单价（元）</label><input type="number" class="form-input output-unit-price" name="output-unit-price[]" placeholder="单价" min="0" step="0.01" value="0" oninput="WorkPage.calculateOutputAmount(this)"></div>';
        rowHtml += '<div class="form-group"><label class="form-label">产值（元）</label><input type="text" class="form-input output-amount" name="output-amount[]" placeholder="0.00" readonly style="background: #f5f5f5; color: var(--primary-color); font-weight: 600;"></div>';
        rowHtml += '<div class="form-group" style="display: flex; align-items: flex-end;"><button type="button" class="btn btn-outline" onclick="WorkPage.removeOutputRow(this)">-</button></div>';
        rowHtml += '</div>';
        rowHtml += '</div>';
        
        container.insertAdjacentHTML('beforeend', rowHtml);
    },
    
    // 删除产值项目行
    removeOutputRow: function(button) {
        var row = button.closest('.output-item-row');
        if (row) {
            row.parentNode.removeChild(row);
            WorkPage.updateTotalAmount();
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
            
            // 现场安装工作量明细
            var installWorkHtml = '';
            if (craneBlocks > 0 || craneBeams > 0 || truckBlocks > 0 || truckBeams > 0) {
                installWorkHtml = '<div style="font-size: 12px;">';
                if (craneBlocks > 0) installWorkHtml += '<div>吊装水泥块：' + craneBlocks + '块</div>';
                if (craneBeams > 0) installWorkHtml += '<div>吊装钢梁：' + craneBeams + '根</div>';
                if (truckBlocks > 0) installWorkHtml += '<div>运输水泥块：' + truckBlocks + '块</div>';
                if (truckBeams > 0) installWorkHtml += '<div>运输钢梁：' + truckBeams + '根</div>';
                installWorkHtml += '</div>';
            } else {
                installWorkHtml = '<span style="color: #999;">无</span>';
            }
            
            // 产值工作量明细
            var outputItemsHtml = '';
            var outputTotal = 0;
            if (record.outputItems && Array.isArray(record.outputItems) && record.outputItems.length > 0) {
                outputItemsHtml = '<div style="font-size: 12px;">';
                record.outputItems.forEach(function(item) {
                    outputItemsHtml += '<div>' + item.name + '：' + item.quantity + item.unit + ' × ¥' + item.unitPrice.toFixed(2) + ' = <strong style="color: var(--primary-color);">¥' + item.amount.toFixed(2) + '</strong></div>';
                    outputTotal += item.amount;
                });
                outputItemsHtml += '</div>';
            } else {
                outputItemsHtml = '<span style="color: #999;">无</span>';
            }
            
            html += '<tr>';
            html += '<td>' + (record.workDate || record.work_date) + '</td>';
            html += '<td><strong>' + projectName + '</strong></td>';
            html += '<td>' + installWorkHtml + '</td>';
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
        
        // 从表单中读取产值工作量
        var outputItems = [];
        var priceTypeSelects = document.querySelectorAll('select[name="output-price-type[]"]');
        var quantityInputs = document.querySelectorAll('input[name="output-quantity[]"]');
        var unitPriceInputs = document.querySelectorAll('input[name="output-unit-price[]"]');
        var amountInputs = document.querySelectorAll('input[name="output-amount[]"]');
        
        for (var i = 0; i < priceTypeSelects.length; i++) {
            var typeName = priceTypeSelects[i].value;
            var quantity = parseFloat(quantityInputs[i].value) || 0;
            var unitPrice = parseFloat(unitPriceInputs[i].value) || 0;
            var amount = parseFloat(amountInputs[i].value) || 0;
            
            if (typeName && quantity > 0) {
                // 获取单位
                var unit = '次';
                var priceTypes = StorageManager.getAllPriceTypes();
                for (var j = 0; j < priceTypes.length; j++) {
                    if (priceTypes[j].name === typeName) {
                        unit = priceTypes[j].unit || '次';
                        break;
                    }
                }
                
                outputItems.push({
                    name: typeName,
                    unit: unit,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    amount: amount
                });
            }
        }
        
        var workData = {
            workDate: workDate,
            project: project,
            craneBlocks: craneBlocks,
            craneBeams: craneBeams,
            truckBlocks: truckBlocks,
            truckBeams: truckBeams,
            outputItems: outputItems,
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
        var outputItems = record.outputItems || [];
        var container = document.getElementById('output-items-container');
        if (container) {
            var priceTypes = StorageManager.getAllPriceTypes();
            container.innerHTML = '';
            
            outputItems.forEach(function(item) {
                var optionsHtml = '';
                priceTypes.forEach(function(type) {
                    var selected = type.name === item.name ? ' selected' : '';
                    optionsHtml += '<option value="' + type.name + '" data-unit="' + type.unit + '"' + selected + '>' + type.name + ' (' + type.unit + ')</option>';
                });
                
                var rowHtml = '<div class="output-item-row" style="background: #fff; padding: 16px; border-radius: 6px; margin-bottom: 12px;">';
                rowHtml += '<div class="form-row">';
                rowHtml += '<div class="form-group"><label class="form-label">单价类型</label><select class="form-select output-price-type" name="output-price-type[]" onchange="WorkPage.calculateOutputAmount(this)">' + optionsHtml + '</select></div>';
                rowHtml += '<div class="form-group"><label class="form-label">数量</label><input type="number" class="form-input output-quantity" name="output-quantity[]" placeholder="数量" min="0" value="' + item.quantity + '" oninput="WorkPage.calculateOutputAmount(this)"></div>';
                rowHtml += '<div class="form-group"><label class="form-label">单价（元）</label><input type="number" class="form-input output-unit-price" name="output-unit-price[]" placeholder="单价" min="0" step="0.01" value="' + item.unitPrice + '" oninput="WorkPage.calculateOutputAmount(this)"></div>';
                rowHtml += '<div class="form-group"><label class="form-label">产值（元）</label><input type="text" class="form-input output-amount" name="output-amount[]" placeholder="0.00" value="' + item.amount.toFixed(2) + '" readonly style="background: #f5f5f5; color: var(--primary-color); font-weight: 600;"></div>';
                rowHtml += '<div class="form-group" style="display: flex; align-items: flex-end;"><button type="button" class="btn btn-outline" onclick="WorkPage.removeOutputRow(this)">-</button></div>';
                rowHtml += '</div>';
                rowHtml += '</div>';
                container.insertAdjacentHTML('beforeend', rowHtml);
            });
            
            // 更新合计
            this.updateTotalAmount();
        }
        
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
        
        // 从表单中读取产值工作量
        var outputItems = [];
        var priceTypeSelects = document.querySelectorAll('select[name="output-price-type[]"]');
        var quantityInputs = document.querySelectorAll('input[name="output-quantity[]"]');
        var unitPriceInputs = document.querySelectorAll('input[name="output-unit-price[]"]');
        var amountInputs = document.querySelectorAll('input[name="output-amount[]"]');
        
        for (var i = 0; i < priceTypeSelects.length; i++) {
            var typeName = priceTypeSelects[i].value;
            var quantity = parseFloat(quantityInputs[i].value) || 0;
            var unitPrice = parseFloat(unitPriceInputs[i].value) || 0;
            var amount = parseFloat(amountInputs[i].value) || 0;
            
            if (typeName && quantity > 0) {
                // 获取单位
                var unit = '次';
                var priceTypes = StorageManager.getAllPriceTypes();
                for (var j = 0; j < priceTypes.length; j++) {
                    if (priceTypes[j].name === typeName) {
                        unit = priceTypes[j].unit || '次';
                        break;
                    }
                }
                
                outputItems.push({
                    name: typeName,
                    unit: unit,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    amount: amount
                });
            }
        }
        
        StorageManager.update('workRecords', id, {
            workDate: workDate,
            project: project,
            craneBlocks: craneBlocks,
            craneBeams: craneBeams,
            truckBlocks: truckBlocks,
            truckBeams: truckBeams,
            outputItems: outputItems,
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
        
        // 重置产值项目为初始状态
        var container = document.getElementById('output-items-container');
        if (container) {
            var priceTypes = StorageManager.getAllPriceTypes();
            var optionsHtml = '<option value="">请选择单价类型</option>';
            priceTypes.forEach(function(type) {
                optionsHtml += '<option value="' + type.name + '" data-unit="' + type.unit + '">' + type.name + ' (' + type.unit + ')</option>';
            });
            
            container.innerHTML = '<div class="output-item-row" style="background: #fff; padding: 16px; border-radius: 6px; margin-bottom: 12px;">' +
                '<div class="form-row">' +
                '<div class="form-group"><label class="form-label">单价类型</label><select class="form-select output-price-type" name="output-price-type[]" onchange="WorkPage.calculateOutputAmount(this)">' + optionsHtml + '</select></div>' +
                '<div class="form-group"><label class="form-label">数量</label><input type="number" class="form-input output-quantity" name="output-quantity[]" placeholder="数量" min="0" value="0" oninput="WorkPage.calculateOutputAmount(this)"></div>' +
                '<div class="form-group"><label class="form-label">单价（元）</label><input type="number" class="form-input output-unit-price" name="output-unit-price[]" placeholder="单价" min="0" step="0.01" value="0" oninput="WorkPage.calculateOutputAmount(this)"></div>' +
                '<div class="form-group"><label class="form-label">产值（元）</label><input type="text" class="form-input output-amount" name="output-amount[]" placeholder="0.00" readonly style="background: #f5f5f5; color: var(--primary-color); font-weight: 600;"></div>' +
                '<div class="form-group" style="display: flex; align-items: flex-end;"><button type="button" class="btn btn-outline" onclick="WorkPage.addOutputRow()">+</button></div>' +
                '</div>' +
                '</div>';
            
            // 重置合计
            var totalSpan = document.getElementById('output-total-amount');
            if (totalSpan) totalSpan.textContent = '0.00';
        }
        
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
