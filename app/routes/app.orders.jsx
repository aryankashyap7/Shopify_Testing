import React, { useEffect } from 'react';
import { json } from '@remix-run/node';
import { useActionData, useNavigation, useSubmit } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  Button,
  DataTable,
  Spinner,
} from '@shopify/polaris';
import { authenticate } from '../shopify.server';

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Fetch orders
  const ordersResponse = await admin.graphql(`#graphql
    query {
      orders(first: 10) {
        edges {
          node {
            id
            name
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

  const ordersData = await ordersResponse.json();

  // Fetch draft orders
  const draftOrdersResponse = await admin.graphql(`#graphql
    query {
      draftOrders(first: 10) {
        edges {
          node {
            id
            name
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

  return json({
    orders: ordersData?.data?.orders?.edges.map((edge) => edge.node) || [],
    draftOrders: draftOrdersData?.data?.draftOrders?.edges.map((edge) => edge.node) || [],
  });
};

export default function OrdersPage() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ['loading', 'submitting'].includes(nav.state) && nav.formMethod === 'POST';

  useEffect(() => {
    if (actionData && actionData.orders && actionData.orders.length > 0) {
      console.log('Orders fetched:', actionData.orders);
    }
    if (actionData && actionData.draftOrders && actionData.draftOrders.length > 0) {
      console.log('Draft Orders fetched:', actionData.draftOrders);
    }
  }, [actionData]);

  const fetchOrders = () => submit({}, { replace: true, method: 'POST' });

  return (
    <Page title="Orders">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button onClick={fetchOrders}>
          Fetch Orders
        </Button>
      </div>
      <Layout>
        <Layout.Section>
          <Card>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <strong>Orders</strong>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                  headings={['Order ID', 'Order Name', 'Customer Name', 'Email', 'Phone', 'Date', 'Total Price', 'Number of Items']}
                  rows={actionData?.orders?.map((order) => [
                    <span key={order.id}>{order.id}</span>,
                    <span>{order.name}</span>,
                    <span>{order.customer ? order.customer.displayName : 'N/A'}</span>,
                    <span>{order.customer ? order.customer.email : 'N/A'}</span>,
                    <span>{order.customer ? order.customer.phone : 'N/A'}</span>,
                    <span>{new Date(order.createdAt).toLocaleString()}</span>,
                    <span>{order.totalPriceSet.shopMoney.amount}</span>,
                    <span>{order.lineItems.edges.reduce((total, item) => total + item.node.quantity, 0)}</span>,
                  ]) || []}
                />
              </>
            )}
          </Card>
          <br></br>
          <Card>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <strong>Draft Orders</strong>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text']}
                  headings={['Draft Order ID', 'Draft Order ID', 'Customer Name', 'Email', 'Phone', 'Date', 'Total Price', 'Number of Items']}
                  rows={actionData?.draftOrders?.map((draftOrder) => [
                    <span key={draftOrder.id}>{draftOrder.id}</span>,
                    <span>{draftOrder.name}</span>,
                    <span>{draftOrder.customer ? draftOrder.customer.displayName : 'N/A'}</span>,
                    <span>{draftOrder.customer ? draftOrder.customer.email : 'N/A'}</span>,
                    <span>{draftOrder.customer ? draftOrder.customer.phone : 'N/A'}</span>,
                    <span>{new Date(draftOrder.createdAt).toLocaleString()}</span>,
                    <span>{draftOrder.totalPriceSet.shopMoney.amount}</span>,
                    <span>{draftOrder.lineItems.edges.reduce((total, item) => total + item.node.quantity, 0)}</span>,
                  ]) || []}
                />
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
