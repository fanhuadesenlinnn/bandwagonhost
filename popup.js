document.addEventListener('DOMContentLoaded', function () {
  const serversList = document.getElementById('servers-list');
  const addServerBtn = document.getElementById('add-server-btn');
  const addServerModal = document.getElementById('add-server-modal');
  const saveServerBtn = document.getElementById('save-server-btn');
  const cancelServerBtn = document.getElementById('cancel-server-btn');
  const serverNameInput = document.getElementById('server-name');
  const veidInput = document.getElementById('veid');
  const apiKeyInput = document.getElementById('api-key');

  // 初始化加载服务器
  function loadServers() {
      chrome.storage.local.get('servers', function (result) {
          const servers = result.servers || [];
          serversList.innerHTML = '';

          if (servers.length === 0) {
              showAddServerModal();
              return;
          }

          servers.forEach((server, index) => {
              fetchServerTraffic(server, index);
          });
      });
  }

  // 获取服务器流量
  function fetchServerTraffic(server, index) {
      const url = `https://api.64clouds.com/v1/getLiveServiceInfo?veid=${server.veid}&api_key=${server.apiKey}`;

      fetch(url)
          .then(response => response.json())
          .then(data => {
              const remainingTraffic = ((data.plan_monthly_data - data.data_counter) / (1024 * 1024 * 1024)).toFixed(2);
              const totalTraffic = (data.plan_monthly_data / (1024 * 1024 * 1024)).toFixed(2);
              const resetDate = data.data_next_reset ? new Date(data.data_next_reset * 1000).toLocaleDateString() : '未知';

              const serverItem = document.createElement('div');
              serverItem.className = 'server-item';
              serverItem.innerHTML = `
                  <div class="server-details">
                      <strong>${server.name}</strong><br>
                      IP: ${data.ip_addresses}<br>
                      总流量: ${totalTraffic} GB<br>
                      剩余流量: ${remainingTraffic} GB<br>
                      重置日期: ${resetDate}
                  </div>
              `;

              const editButton = document.createElement('button');
              editButton.className = 'btn';
              editButton.textContent = '编辑';
              editButton.addEventListener('click', () => editServer(index));

              const deleteButton = document.createElement('button');
              deleteButton.className = 'btn btn-delete';
              deleteButton.textContent = '删除';
              deleteButton.addEventListener('click', () => deleteServer(index));

              serverItem.appendChild(editButton);
              serverItem.appendChild(deleteButton);
              serversList.appendChild(serverItem);
          })
          .catch(error => {
              console.error('获取服务器信息失败', error);
          });
  }

  // 显示添加服务器模态框
  function showAddServerModal() {
      addServerModal.style.display = 'flex';
  }

  // 保存服务器
  saveServerBtn.addEventListener('click', function () {
      const name = serverNameInput.value.trim();
      const veid = veidInput.value.trim();
      const apiKey = apiKeyInput.value.trim();

      if (!name || !veid || !apiKey) {
          alert('请填写完整信息');
          return;
      }

      chrome.storage.local.get('servers', function (result) {
          const servers = result.servers || [];
          servers.push({ name, veid, apiKey });

          chrome.storage.local.set({ servers }, function () {
              addServerModal.style.display = 'none';
              serverNameInput.value = '';
              veidInput.value = '';
              apiKeyInput.value = '';
              loadServers();
          });
      });
  });

  // 取消添加服务器
  cancelServerBtn.addEventListener('click', function () {
      addServerModal.style.display = 'none';
  });

  // 添加服务器按钮
  addServerBtn.addEventListener('click', showAddServerModal);

  // 全局函数：删除服务器
  window.deleteServer = function (index) {
      chrome.storage.local.get('servers', function (result) {
          const servers = result.servers || [];
          servers.splice(index, 1);

          chrome.storage.local.set({ servers }, loadServers);
      });
  };

  // 全局函数：编辑服务器
  window.editServer = function (index) {
      chrome.storage.local.get('servers', function (result) {
          const servers = result.servers || [];
          const server = servers[index];

          serverNameInput.value = server.name;
          veidInput.value = server.veid;
          apiKeyInput.value = server.apiKey;

          addServerModal.style.display = 'flex';

          // 编辑时先删除原服务器
          servers.splice(index, 1);
          chrome.storage.local.set({ servers });
      });
  };

  // 初始加载
  loadServers();
});