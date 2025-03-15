const deleteConversation =({id, title, submit}) =>{
    const deleteConfirm = confirm(
        `Delete chat? \n\n You'll no longer see this chat here. This will also delete related activity like Prompts and responses`,
    );
    if (!deleteConfirm) return;
    submit(
        {
            request_type: 'delete_conversation',
            conversation_id:id,
            conversation_title:title
        },
        {
            method:'DELETE',
            encType: 'application/x-www-form-urlencoded',
            action:'/',
        },
    );

};

export default deleteConversation;