document.addEventListener('DOMContentLoaded', function() {
  var nameInput = document.getElementById('nameInput');
  var letterInput = document.getElementById('letterInput');
  var tagContainer = document.getElementById('tagContainer');
  var exportButton = document.getElementById('exportButton');
  var clipboardButton = document.getElementById('clipboardButton');

  // Move focus from name input to IC input on Enter key
  nameInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      letterInput.focus();
    }
  });

  letterInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag(letterInput.value);
      letterInput.value = '';
      letterInput.focus();
    } else if (event.key === 'Delete') {
      if (letterInput.value === '') {
        event.preventDefault();
        deleteMostRecentTag();
        letterInput.focus();
      }
    }
  });

  function addTag(text) {
    if (text.trim() === '') {
      return;
    }

    var tag = document.createElement('div');
    tag.className = 'tag';

    var span = document.createElement('span');
    span.textContent = text;
    tag.appendChild(span);

    var deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.title = 'Delete';
    deleteButton.innerHTML = '&times;';

    deleteButton.addEventListener('click', function() {
      deleteTag(tag);
      letterInput.focus();
    });
    tag.appendChild(deleteButton);

    // Check if the text matches the "IC" followed by digits format
    var icPattern = /^IC\d+$/;
    if (icPattern.test(text.trim())) {
      tag.classList.add('tag-valid');
    } else {
      tag.classList.add('tag-invalid');
    }

    tagContainer.appendChild(tag);
  }

  function deleteTag(tag) {
    // Add 'removing' class to trigger CSS transition
    tag.classList.add('removing');

    // After transition ends, remove the tag from DOM
    tag.addEventListener('transitionend', function() {
      tag.remove();
    });
  }

  function deleteMostRecentTag() {
    var tags = tagContainer.getElementsByClassName('tag');
    if (tags.length > 0) {
      var lastTag = tags[tags.length - 1];
      deleteTag(lastTag);
    }
  }

  exportButton.addEventListener('click', function() {
    exportTagsToCSV();
  });

  function exportTagsToCSV() {
    var name = nameInput.value.trim();
    if (name === '') {
      alert('Please enter your name before exporting.');
      return;
    }

    var csvContent = 'Name,' + name + '\n';
    csvContent += 'Letters\n';

    var tags = tagContainer.getElementsByClassName('tag');
    for (var i = 0; i < tags.length; i++) {
      var text = tags[i].getElementsByTagName('span')[0].textContent;
      csvContent += text + '\n';
    }

    // Sanitize the name to use in the filename
    var sanitizedFileName = name.replace(/[^a-z0-9]/gi, '_');

    // Get current date and time
    var now = new Date();
    var timestamp = now.getFullYear().toString() +
        ('0' + (now.getMonth() + 1)).slice(-2) +
        ('0' + now.getDate()).slice(-2) + '_' +
        ('0' + now.getHours()).slice(-2) +
        ('0' + now.getMinutes()).slice(-2) +
        ('0' + now.getSeconds()).slice(-2);

    var filename = sanitizedFileName + '_' + timestamp + '.csv';

    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback for browsers that do not support download attribute
      navigator.msSaveBlob(blob, filename);
    }
  }

  clipboardButton.addEventListener('click', function() {
    copyTagsToClipboard();
  });

  function copyTagsToClipboard() {
    var name = nameInput.value.trim();
    if (name === '') {
      alert('Please enter your name before copying.');
      return;
    }

    var textToCopy = 'Name: ' + name + '\n';
    textToCopy += 'Order Numbers:\n';

    var tags = tagContainer.getElementsByClassName('tag');
    for (var i = 0; i < tags.length; i++) {
      var text = tags[i].getElementsByTagName('span')[0].textContent;
      textToCopy += text + '\n';
    }

    navigator.clipboard.writeText(textToCopy).then(function() {
      // Change the clipboard button to a checkmark
      clipboardButton.innerHTML = '✅';

      // Optionally, add a class for styling
      clipboardButton.classList.add('success');

      // Revert back to the clipboard emoji after 2 seconds
      setTimeout(function() {
        clipboardButton.innerHTML = '📋';
        clipboardButton.classList.remove('success');
      }, 2000);
    }, function(err) {
      alert('Could not copy text: ' + err);
    });
  }
});
