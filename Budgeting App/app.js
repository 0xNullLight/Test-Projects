document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('budgetForm');
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('newCategory');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const tableBody = document.querySelector('#budgetTable tbody');
    const totalDisplay = document.getElementById('totalDisplay');
    const sortBySelect = document.getElementById('sortBy');
    const fileInput = document.getElementById('fileInput');
    const uploadCSVBtn = document.getElementById('uploadCSV');
    const selectAllCheckbox = document.getElementById('selectAll');
    const removeSelectedBtn = document.getElementById('removeSelected');

    // Load categories from local storage
    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const selectedCategory = localStorage.getItem('selectedCategory') || '';

        // Populate category dropdown
        categorySelect.innerHTML = `<option value="" ${selectedCategory === '' ? 'selected' : 'disabled'}>Select a category</option>`;
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        const addNewOption = document.createElement('option');
        addNewOption.value = 'addNew';
        addNewOption.textContent = 'Add a new category';
        categorySelect.appendChild(addNewOption);
        categorySelect.value = selectedCategory;

        if (selectedCategory === 'addNew') {
            newCategoryInput.classList.remove('d-none');
            addCategoryBtn.classList.remove('d-none');
        } else {
            newCategoryInput.classList.add('d-none');
            addCategoryBtn.classList.add('d-none');
        }
    }

    // Save categories and selected value to local storage
    function saveCategories() {
        const options = Array.from(categorySelect.options);
        const categories = options
            .filter(option => option.value && option.value !== 'addNew')
            .map(option => option.value);

        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('selectedCategory', categorySelect.value);
    }

    // Handle category selection
    categorySelect.addEventListener('change', function() {
        if (this.value === 'addNew') {
            newCategoryInput.classList.remove('d-none');
            addCategoryBtn.classList.remove('d-none');
        } else {
            newCategoryInput.classList.add('d-none');
            addCategoryBtn.classList.add('d-none');
        }
        saveCategories();
    });

    // Add new category
    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();

        if (newCategory === '') {
            alert('Please enter a new category.');
            return;
        }

        // Check if the category already exists
        if (Array.from(categorySelect.options).some(option => option.value === newCategory)) {
            alert('Category already exists.');
        } else {
            // Add new category to dropdown
            const newOption = document.createElement('option');
            newOption.value = newCategory;
            newOption.textContent = newCategory;
            categorySelect.insertBefore(newOption, categorySelect.querySelector('#addNewOption'));
            newCategoryInput.value = '';
            newCategoryInput.classList.add('d-none');
            addCategoryBtn.classList.add('d-none');
            categorySelect.value = newCategory; // Set the new category as selected

            saveCategories();
        }
    });

    // Handle form submission (only affects the table)
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        const date = formatDate(document.getElementById('date').value);
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);

        // Validation checks
        if (category === '' || category === 'addNew') {
            alert('Please select or add a category before submitting.');
            return;
        }

        if (date === '' || isNaN(amount) || amount <= 0) {
            alert('Please fill in all fields correctly.');
            return;
        }

        // Create a new table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="select-row"></td>
            <td>${date}</td>
            <td>${category}</td>
            <td>$${amount.toFixed(2)}</td>
        `;

        // Append the new row to the table
        tableBody.appendChild(row);

        // Clear form fields
        form.reset();
        categorySelect.value = ''; // Reset category to the default option
        newCategoryInput.classList.add('d-none'); // Hide new category input
        addCategoryBtn.classList.add('d-none'); // Hide add category button

        // Add event listener to the new checkbox
        row.querySelector('.select-row').addEventListener('change', updateTotal);
    });

    // Function to format dates to YYYY-MM-DD
    function formatDate(date) {
        const [year, month, day] = date.split('-');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Function to update the total amount based on selected rows
    function updateTotal() {
        let total = 0;
        document.querySelectorAll('#budgetTable tbody .select-row:checked').forEach(checkbox => {
            const amountCell = checkbox.closest('tr').querySelector('td:nth-child(4)');
            total += parseFloat(amountCell.textContent.replace('$', ''));
        });
        totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Handle CSV upload
    uploadCSVBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const rows = e.target.result.split('\n').slice(1);
                rows.forEach(row => {
                    const [date, category, amount] = row.split(',');
                    if (date && category && amount) {
                        const formattedDate = formatDate(date);
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><input type="checkbox" class="select-row"></td>
                            <td>${formattedDate}</td>
                            <td>${category}</td>
                            <td>$${parseFloat(amount).toFixed(2)}</td>
                        `;
                        tableBody.appendChild(row);

                        // Add event listener to the new checkbox
                        row.querySelector('.select-row').addEventListener('change', updateTotal);
                    }
                });

                // Update total after adding new rows
                updateTotal();
            };
            reader.readAsText(file);
        } else {
            alert('Please upload a valid CSV file.');
        }
    });

    // Handle select all checkbox
    selectAllCheckbox.addEventListener('change', function() {
        document.querySelectorAll('#budgetTable tbody .select-row').forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        // Update total based on new selection
        updateTotal();
    });

    // Handle sort by change
    sortBySelect.addEventListener('change', function() {
        const rowsArray = Array.from(tableBody.querySelectorAll('tr'));
        const sortBy = this.value;

        rowsArray.sort((a, b) => {
            const cellA = a.querySelector(`td:nth-child(${sortBy === 'date' ? 2 : sortBy === 'category' ? 3 : 4})`).textContent;
            const cellB = b.querySelector(`td:nth-child(${sortBy === 'date' ? 2 : sortBy === 'category' ? 3 : 4})`).textContent;

            if (sortBy === 'date') {
                return new Date(cellA) - new Date(cellB);
            } else if (sortBy === 'amount') {
                return parseFloat(cellA.replace('$', '')) - parseFloat(cellB.replace('$', ''));
            } else {
                return cellA.localeCompare(cellB);
            }
        });

        tableBody.innerHTML = '';
        rowsArray.forEach(row => tableBody.appendChild(row));

        // Update total
        updateTotal();
    });

    // Handle remove selected button
    removeSelectedBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('#budgetTable tbody .select-row:checked');

        if (selectedCheckboxes.length === 0) {
            alert('No items selected to remove.');
        } else {
            selectedCheckboxes.forEach(checkbox => {
                checkbox.closest('tr').remove();
            });
            // Update total
            updateTotal();
        }
    });

    // Initialize the app
    loadCategories();
});
