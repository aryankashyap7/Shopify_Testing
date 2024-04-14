import React, { useState, useEffect } from 'react';
import { json } from '@remix-run/node';
import { useActionData, useSubmit } from '@remix-run/react';
import { Page, Layout, Card, Button, DataTable, Spinner, TextField } from '@shopify/polaris';
import { authenticate } from '../shopify.server';

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const draftOrdersResponse = await admin.graphql(`
    query {
      draftOrders(first: 100) {
        edges {
          node {
            id
            name
            status
            poNumber
            customer {
              displayName
              email
              phone
            }
            createdAt
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `);
  const draftOrdersData = await draftOrdersResponse.json();
  const formattedDraftOrders = draftOrdersData.data.draftOrders.edges.map((edge) => ({
    id: edge.node.id,
    name: edge.node.name,
    status: edge.node.status || 'N/A',
    poNumber: edge.node.poNumber || 'N/A',
    customerName: edge.node.customer?.displayName || 'N/A',
    email: edge.node.customer?.email || 'N/A',
    phone: edge.node.customer?.phone || 'N/A',
    date: new Date(edge.node.createdAt).toISOString(),
    totalPrice: `${edge.node.totalPriceSet?.shopMoney?.amount || 'N/A'} ${edge.node.totalPriceSet?.shopMoney?.currencyCode || 'N/A'}`,
    numberOfItems: edge.node.lineItems.edges.reduce((total, itemEdge) => total + itemEdge.node.quantity, 0),
  }));

  return json({ draftOrders: formattedDraftOrders });
};

export default function OrdersPage() {
  const actionData = useActionData();
  const submit = useSubmit();
  const [loadingDraftOrders, setLoadingDraftOrders] = useState(false);
  const [draftOrders, setDraftOrders] = useState([]);
  const [pixelId, setPixelId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const fetchDraftOrders = async () => {
    setLoadingDraftOrders(true);
    submit({}, { replace: true, method: 'POST' });
  };

  const sendData = async () => {
    const dataToSend = {
      pixelId,
      accessToken,
      draftOrders,
    };
    const response = await fetch('https://webhook.site/e6717bc6-8846-4b8c-90ab-fd0353541bbd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
      mode: 'no-cors',
    });
    if (!response.ok) {
      console.error(`Failed to send data: Status ${response.status}`);
    }
  };

  useEffect(() => {
    if (actionData && actionData.draftOrders) {
      setDraftOrders(actionData.draftOrders);
      setLoadingDraftOrders(false);
    }
  }, [actionData]);

  return (
    <Page title="Orders">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button onClick={fetchDraftOrders} loading={loadingDraftOrders}>
                {loadingDraftOrders ? 'Fetching Draft Orders...' : 'Fetch Draft Orders'}
              </Button>
            </div>
            {loadingDraftOrders ? (
              <Spinner />
            ) : (
              <>
                <strong>Draft Orders</strong>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text']}
                  headings={['Draft Order ID', 'Draft Order Name', 'Order Status', 'PO Number', 'Customer Name', 'Email', 'Phone', 'Date', 'Total Price', 'Number of Items']}
                  rows={draftOrders.map((draftOrder) => [
                    <span key={draftOrder.id}>{draftOrder.id}</span>,
                    <span>{draftOrder.name}</span>,
                    <span>{draftOrder.status}</span>,
                    <span>{draftOrder.poNumber}</span>,
                    <span>{draftOrder.customerName}</span>,
                    <span>{draftOrder.email}</span>,
                    <span>{draftOrder.phone}</span>,
                    <span>{new Date(draftOrder.date).toLocaleString()}</span>,
                    <span>{draftOrder.totalPrice}</span>,
                    <span>{draftOrder.numberOfItems}</span>,
                  ])}
                />
              </>
            )}
          </Card>

          <Card>
            <div style={{ marginBottom: '1rem' }}>
              <TextField
                label="Pixel ID"
                value={pixelId}
                onChange={(value) => setPixelId(value)}
                autoComplete="off"
              />
              <TextField
                label="Access Token"
                value={accessToken}
                onChange={(value) => setAccessToken(value)}
                autoComplete="off"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button onClick={sendData}>Send Data</Button>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
