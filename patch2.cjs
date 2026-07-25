const fs = require('fs');

const path = 'src/pages/Admin/AdminDashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// The JSX for Examples starts at {/* Examples Section */}
// And ends right before {/* Execution Constraints */}
const startIdx = code.indexOf('{/* Examples Section */}');
const endIdx = code.indexOf('{/* Execution Constraints */}');

if (startIdx !== -1 && endIdx !== -1) {
  let examplesJSX = code.substring(startIdx, endIdx);
  
  // Also get Execution Constraints and Test Cases
  const testCasesEndIdx = code.indexOf('<div className="flex space-x-4">', endIdx);
  
  let allExtraFields = code.substring(startIdx, testCasesEndIdx);
  
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

  // Find the insertion point in the Edit form
  const editFormStart = code.indexOf('<form onSubmit={handleUpdateProblem} className="space-y-6">');
  const editFormButtons = '<div className="flex space-x-4">';
  const editFormButtonsIndex = code.indexOf(editFormButtons, editFormStart);
  
  if (editFormStart !== -1 && editFormButtonsIndex !== -1) {
    // Remove the empty {/* Examples Section */} we left last time if it exists
    const marker = '{/* Examples Section */}\\s*';
    const regex = new RegExp(marker);
    code = code.replace(regex, '');
    
    // Refresh the index since we removed the marker
    const newEditFormButtonsIndex = code.indexOf(editFormButtons, editFormStart);
    
    code = code.substring(0, newEditFormButtonsIndex) + allExtraFields + '\n                        ' + code.substring(newEditFormButtonsIndex);
    fs.writeFileSync(path, code);
    console.log('Successfully injected full fields.');
  } else {
    console.log('Failed to find insertion point');
  }
} else {
  console.log('Failed to extract');
}
