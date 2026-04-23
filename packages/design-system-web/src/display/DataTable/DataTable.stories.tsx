import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Badge } from '../Badge';

const meta: Meta<typeof DataTable> = {
  title: 'Design System/Display/DataTable',
  component: DataTable as React.ComponentType,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

import type React from 'react';

type Story = StoryObj<typeof meta>;

import type { BookingStatus } from '../Badge';

interface Booking {
  id: string;
  client: string;
  service: string;
  date: string;
  status: BookingStatus;
}

const bookings: Booking[] = [
  {
    id: 'B001',
    client: 'Jan Kowalski',
    service: 'Wymiana opon',
    date: '23.04.2026',
    status: 'CONFIRMED',
  },
  {
    id: 'B002',
    client: 'Anna Nowak',
    service: 'Wyważanie kół',
    date: '24.04.2026',
    status: 'PENDING',
  },
  {
    id: 'B003',
    client: 'Piotr Wiśniewski',
    service: 'Geometria',
    date: '22.04.2026',
    status: 'COMPLETED',
  },
  {
    id: 'B004',
    client: 'Maria Dąbrowska',
    service: 'Wymiana opon',
    date: '21.04.2026',
    status: 'CANCELLED',
  },
];

const columns = [
  { key: 'id', header: 'Nr', width: '80px' },
  { key: 'client', header: 'Klient' },
  { key: 'service', header: 'Usługa' },
  { key: 'date', header: 'Data', width: '120px' },
  {
    key: 'status',
    header: 'Status',
    width: '130px',
    render: (row: Booking) => <Badge status={row.status} />,
  },
];

export const Default: Story = {
  render: () => <DataTable columns={columns} data={bookings} keyField="id" />,
};

export const Clickable: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={bookings}
      keyField="id"
      onRowClick={(row) => alert(`Kliknięto: ${row.client}`)}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable columns={columns} data={[]} keyField="id" emptyMessage="Brak rezerwacji na dziś" />
  ),
};
