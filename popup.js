document.addEventListener('DOMContentLoaded', function() {
    const veidInput = document.getElementById('veid');
    const apiKeyInput = document.getElementById('apikey');
    const saveBtn = document.getElementById('save-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const configSection = document.getElementById('config-section');
    const trafficSection = document.getElementById('traffic-section');
    const errorSection = document.getElementById('error-section');
  
    // 加载已保存的配置
    chrome.storage.local.get(['veid', 'apikey'], function(result) {
      if (result.veid && result.apikey) {
        veidInput.value = result.veid;
        apiKeyInput.value = result.apikey;
        fetchTrafficData(result.veid, result.apikey);
      }
    });
  
    // 保存配置
    saveBtn.addEventListener('click', function() {
      const veid = veidInput.value.trim();
      const apikey = apiKeyInput.value.trim();
  
      if (!veid || !apikey) {
        showError('请输入VEID和API Key');
        return;
      }
  
      chrome.storage.local.set({veid: veid, apikey: apikey}, function() {
        fetchTrafficData(veid, apikey);
      });
    });
  
    // 刷新流量
    refreshBtn.addEventListener('click', function() {
      chrome.storage.local.get(['veid', 'apikey'], function(result) {
        fetchTrafficData(result.veid, result.apikey);
      });
    });
  
    // 获取流量数据
    function fetchTrafficData(veid, apikey) {
      const url = `https://api.64clouds.com/v1/getLiveServiceInfo?veid=${veid}&api_key=${apikey}`;
      
      chrome.runtime.sendMessage(
        {action: 'fetchTrafficData', url: url},
        function(response) {
          if (response.success) {
            displayTrafficInfo(response.data);
          } else {
            showError('获取流量信息失败：' + response.error);
          }
        }
      );
    }
  
    // 显示流量信息
    function displayTrafficInfo(data) {
      const totalTraffic = data.plan_monthly_data;
      const usedTraffic = data.data_counter;
      const remainingTraffic = totalTraffic - usedTraffic;
  
      document.getElementById('server-name').textContent = data.hostname || '未知服务器';
      document.getElementById('total-traffic').textContent = `${(totalTraffic / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      document.getElementById('used-traffic').textContent = `${(usedTraffic / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      document.getElementById('remaining-traffic').textContent = `${(remainingTraffic / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      document.getElementById('reset-date').textContent = data.data_next_reset ? new Date(data.data_next_reset * 1000).toLocaleDateString() : '未知';
  
      configSection.style.display = 'none';
      trafficSection.style.display = 'block';
      errorSection.style.display = 'none';
    }
  
    // 显示错误信息
    function showError(message) {
      document.getElementById('error-message').textContent = message;
      configSection.style.display = 'block';
      trafficSection.style.display = 'none';
      errorSection.style.display = 'block';
    }
  });