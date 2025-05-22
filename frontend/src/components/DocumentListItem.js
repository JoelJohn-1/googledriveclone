import React from 'react';
import { ListItem, ListItemText, Typography, Link } from '@mui/material';
import PropTypes from 'prop-types';

function DocumentListItem({ doc }) {
    DocumentListItem.propTypes = {
        doc: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            ownerId: PropTypes.string.isRequired,
            updatedAt: PropTypes.string.isRequired, // or instanceOf(Date) if you're converting earlier
        }).isRequired,
    };

    return (
        <ListItem>
            <ListItemText
                primary={
                    <Link href={`/documents/${doc._id}`}>
                        {doc.title}
                    </Link>
                }
                secondary={
                    <>
                        <Typography component="span" variant="body2" color="text.primary">
                            Owner: {doc.ownerId}
                        </Typography>
                        {' — Updated: ' + new Date(doc.updatedAt).toLocaleString()}
                    </>
                }
            />
        </ListItem>
    );
}

export default DocumentListItem;
