import React, { useState } from 'react';
import { Page, LegacyCard, DataTable } from '@shopify/polaris';

function ContactsPage() {
  const [contacts] = useState([
    {
      id: 1,
      name: 'Aryan Kashyap',
      email: 'aryan.kashyap@google.com',
      phoneNumber: '123-456-7890',
      address: 'India',
    },
    {
      id: 2,
      name: 'Samsung Galaxy',
      email: 'galaxy@samsung.com',
      phoneNumber: '987-654-3210',
      address: 'South Korea',
    },
    {
      id: 3,
      name: 'Apple Vision',
      email: 'vision@apple.com',
      phoneNumber: '987-654-3210',
      address: 'California',
    },
  ]);

  return (
    <Page title="Contacts">
      <LegacyCard>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={['ID', 'Name', 'Email', 'Phone Number', 'Address']}
          rows={contacts.map(contact => Object.values(contact))}
          totals={['', '', '', '', '']}
        />
      </LegacyCard>
    </Page>
  );
}

export default ContactsPage;
