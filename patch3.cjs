const fs = require('fs');
const path = 'src/pages/Admin/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// The first Examples Section is in Create form.
const createFormStart = code.indexOf('{/* Examples Section */}');
const createFormEnd = code.indexOf('<div className="flex space-x-4">', createFormStart);

if (createFormStart !== -1 && createFormEnd !== -1) {
  let allExtraFields = code.substring(createFormStart, createFormEnd);
  
  // Replace newProblem with (editProblemData || {})
  allExtraFields = allExtraFields.replace(/newProblem/g, '(editProblemData || {})');
  allExtraFields = allExtraFields.replace(/setNewProblem\(\{\.\.\.\(editProblemData \|\| \{\}\), /g, 'setEditProblemData({...editProblemData, ');
  
  // Fix specific edge case
  allExtraFields = allExtraFields.replace(/setNewProblem/g, 'setEditProblemData');
  
  // Replace helper functions
  allExtraFields = allExtraFields.replace(/addExample/g, 'addEditExample');
  allExtraFields = allExtraFields.replace(/removeExample/g, 'removeEditExample');
  allExtraFields = allExtraFields.replace(/updateExample/g, 'updateEditExample');
  
  allExtraFields = allExtraFields.replace(/addTestCase/g, 'addEditTestCase');
  allExtraFields = allExtraFields.replace(/removeTestCase/g, 'removeEditTestCase');
  allExtraFields = allExtraFields.replace(/updateTestCase/g, 'updateEditTestCase');

  // Find the Edit Problem form
  const editFormStart = code.indexOf('<form onSubmit={handleUpdateProblem} className="space-y-6">');
  const editFormButtons = '<div className="flex space-x-4">';
  const editFormButtonsIndex = code.indexOf(editFormButtons, editFormStart);
  
  if (editFormStart !== -1 && editFormButtonsIndex !== -1) {
    // We already have a dummy {/* Examples Section */} in the edit form, let's remove it and everything up to the buttons
    const dummyStart = code.indexOf('{/* Examples Section */}', editFormStart);
    if (dummyStart !== -1 && dummyStart < editFormButtonsIndex) {
      code = code.substring(0, dummyStart) + allExtraFields + code.substring(editFormButtonsIndex);
    } else {
      code = code.substring(0, editFormButtonsIndex) + allExtraFields + code.substring(editFormButtonsIndex);
    }
    
    fs.writeFileSync(path, code);
    console.log('Successfully injected full fields.');
  } else {
    console.log('Failed to find edit form insertion point');
  }
} else {
  console.log('Failed to find create form block');
}
