const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-form-input')

searchInput.addEventListener('focus', function() {
  searchForm.classList.add('focused')
})
searchInput.addEventListener('blur', function() {
  searchForm.classList.remove('focused')
})
