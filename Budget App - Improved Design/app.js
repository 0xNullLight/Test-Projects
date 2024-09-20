document.addEventListener('DOMContentLoaded', () => {
  const budgetTable = document.getElementById('budgetTable');
  const addRowBtn = document.getElementById('addRowBtn');
  const downloadCSVBtn = document.getElementById('downloadCSVBtn');
  const totalAmountDisplay = document.getElementById('totalAmount');
  const addNewCategoryBtn = document.getElementById('addNewCategoryBtn');
  const newCategoryInput = document.getElementById('newCategoryInput');
  const categoryList = document.getElementById('categoryList');
  const sortSelect = document.getElementById('sortSelect');
  const filterSelect = document.getElementById('filterSelect');
  const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));

  let categories = JSON.parse(localStorage.getItem('categories')) || ['Groceries', 'Rent', 'Utilities', 'Entertainment'];
  let budgetEntries = JSON.parse(localStorage.getItem('budgetEntries')) || [];
  let categorySelectToUpdate;

  function refreshCategoryList() {
      categoryList.innerHTML = '';
      categories.forEach(category => {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-center';
          li.textContent = category;

          const removeBtn = document.createElement('button');
          removeBtn.className = 'btn btn-danger btn-sm';
          removeBtn.textContent = 'Remove';
          removeBtn.addEventListener('click', () => removeCategory(category));

          li.appendChild(removeBtn);
          categoryList.appendChild(li);
      });
      updateFilterSelect();
  }

  function updateFilterSelect() {
      filterSelect.innerHTML = '<option value="all">All</option>';
      categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          filterSelect.appendChild(option);
      });
  }

  function loadBudgetEntries() {
      budgetTable.innerHTML = '';
      budgetEntries.forEach(entry => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td><input type="checkbox" class="selectRow"></td>
              <td><input type="date" class="form-control date-input" value="${entry.date}"></td>
              <td>
                  <select class="form-control category-select">
                      ${categories.map(cat => `<option value="${cat}" ${cat === entry.category ? 'selected' : ''}>${cat}</option>`).join('')}
                      <option value="add-new">Add new category...</option>
                  </select>
              </td>
              <td><input type="number" class="form-control amount" placeholder="Amount" min="0" step="0.01" value="${entry.amount}"></td>
              <td><button class="btn btn-danger deleteBtn">Delete</button></td>
          `;
          budgetTable.appendChild(row);
          attachRowListeners(row);
      });
  }

  addRowBtn.addEventListener('click', () => {
      const row = document.createElement('tr');
      let categoryOptions = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
      categoryOptions += '<option value="add-new">Add new category...</option>';

      row.innerHTML = `
          <td><input type="checkbox" class="selectRow"></td>
          <td><input type="date" class="form-control date-input"></td>
          <td>
              <select class="form-control category-select">
                  ${categoryOptions}
              </select>
          </td>
          <td><input type="number" class="form-control amount" placeholder="Amount" min="0" step="0.01"></td>
          <td><button class="btn btn-danger deleteBtn">Delete</button></td>
      `;

      budgetTable.appendChild(row);
      attachRowListeners(row);
      budgetEntries.push({ date: '', category: '', amount: 0 });
      saveBudgetEntries();
  });

  function attachRowListeners(row) {
      const checkbox = row.querySelector('.selectRow');
      const amountField = row.querySelector('.amount');
      const categorySelect = row.querySelector('.category-select');
      const dateInput = row.querySelector('.date-input');

      checkbox.addEventListener('change', calculateTotal);
      amountField.addEventListener('input', calculateTotal);
      categorySelect.addEventListener('change', (e) => {
          if (e.target.value === 'add-new') {
              categoryModal.show();
              categorySelectToUpdate = e.target;
          }
      });
      dateInput.addEventListener('change', saveBudgetEntries);
      amountField.addEventListener('change', saveBudgetEntries);
      categorySelect.addEventListener('change', saveBudgetEntries);

      const deleteBtn = row.querySelector('.deleteBtn');
      deleteBtn.addEventListener('click', () => {
          row.remove();
          budgetEntries = budgetEntries.filter(entry => entry.date !== dateInput.value || entry.amount !== amountField.value);
          calculateTotal();
          saveBudgetEntries();
      });
  }

  function calculateTotal() {
      const rows = document.querySelectorAll('tbody tr');
      let total = 0;

      rows.forEach(row => {
          const checkbox = row.querySelector('.selectRow');
          const amountField = row.querySelector('.amount');

          if (checkbox && checkbox.checked) {
              const amount = parseFloat(amountField.value) || 0;
              total += amount;
          }
      });

      totalAmountDisplay.textContent = `Total: $${total.toFixed(2)}`;
  }

  addNewCategoryBtn.addEventListener('click', () => {
      const newCategory = newCategoryInput.value.trim();
      if (newCategory && !categories.includes(newCategory)) {
          categories.push(newCategory);
          updateAllCategoryDropdowns();
          refreshCategoryList();
          saveCategories();

          if (categorySelectToUpdate) {
              categorySelectToUpdate.value = newCategory;
          }

          categoryModal.hide();
          newCategoryInput.value = '';
      }
  });

  function saveCategories() {
      localStorage.setItem('categories', JSON.stringify(categories));
  }

  function saveBudgetEntries() {
      const rows = document.querySelectorAll('tbody tr');
      budgetEntries = [];

      rows.forEach(row => {
          const date = row.querySelector('.date-input').value;
          const category = row.querySelector('.category-select').value;
          const amount = parseFloat(row.querySelector('.amount').value) || 0;
          if (date && category && amount) {
              budgetEntries.push({ date, category, amount });
          }
      });

      localStorage.setItem('budgetEntries', JSON.stringify(budgetEntries));
      calculateTotal();
  }

  function updateAllCategoryDropdowns() {
      const allCategorySelects = document.querySelectorAll('.category-select');
      allCategorySelects.forEach(select => {
          select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('') + '<option value="add-new">Add new category...</option>';
      });
  }

  function removeCategory(category) {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const categoryInUse = rows.some(row => row.querySelector('.category-select').value === category);

      if (categoryInUse) {
          alert(`Category "${category}" is in use and cannot be removed.`);
          return;
      }

      categories = categories.filter(cat => cat !== category);
      updateAllCategoryDropdowns();
      refreshCategoryList();
      saveCategories();
  }

  downloadCSVBtn.addEventListener('click', () => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const csvData = [];

      rows.forEach(row => {
          const dateInput = row.querySelector('.date-input').value;
          const category = row.querySelector('.category-select').value;
          const amount = row.querySelector('.amount').value;
          csvData.push([dateInput, category, amount]);
      });

      const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "budget.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  });

  filterSelect.addEventListener('change', () => {
      const selectedCategory = filterSelect.value;
      const rows = document.querySelectorAll('tbody tr');

      rows.forEach(row => {
          const category = row.querySelector('.category-select').value;
          row.style.display = selectedCategory === 'all' || category === selectedCategory ? '' : 'none';
      });

      calculateTotal();
  });

  sortSelect.addEventListener('change', () => {
      sortTable(sortSelect.value);
  });

  function sortTable(criteria) {
      const rows = Array.from(document.querySelectorAll('tbody tr'));

      rows.sort((a, b) => {
          const dateA = new Date(a.querySelector('.date-input').value);
          const dateB = new Date(b.querySelector('.date-input').value);
          const categoryA = a.querySelector('.category-select').value;
          const categoryB = b.querySelector('.category-select').value;
          const amountA = parseFloat(a.querySelector('.amount').value) || 0;
          const amountB = parseFloat(b.querySelector('.amount').value) || 0;

          if (criteria === 'date') {
              return dateA - dateB;
          } else if (criteria === 'category') {
              return categoryA.localeCompare(categoryB);
          } else if (criteria === 'amount') {
              return amountA - amountB;
          }
      });

      budgetTable.innerHTML = '';
      rows.forEach(row => budgetTable.appendChild(row));
  }

  // Initial load
  refreshCategoryList();
  loadBudgetEntries();
});
