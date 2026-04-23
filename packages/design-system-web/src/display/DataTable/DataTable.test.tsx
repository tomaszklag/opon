import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable } from './DataTable';

interface Row {
  id: string;
  name: string;
  status: string;
}

const columns = [
  { key: 'id' as const, header: 'ID' },
  { key: 'name' as const, header: 'Name' },
  { key: 'status' as const, header: 'Status' },
];

const data: Row[] = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'inactive' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} keyField="id" />);
    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} keyField="id" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders empty message when data is empty', () => {
    render(<DataTable columns={columns} data={[]} keyField="id" emptyMessage="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('uses default empty message', () => {
    render(<DataTable columns={columns} data={[]} keyField="id" />);
    expect(screen.getByText('Brak danych')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} keyField="id" onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('calls onRowClick on Enter key', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} keyField="id" onRowClick={onRowClick} />);
    const rows = screen.getAllByRole('row');
    fireEvent.keyDown(rows[1]!, { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('renders custom cell via render function', () => {
    const customColumns = [
      ...columns,
      { key: 'custom', header: 'Action', render: (_row: Row) => <button>Edit</button> },
    ];
    render(<DataTable columns={customColumns} data={data} keyField="id" />);
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('renders table element', () => {
    render(<DataTable columns={columns} data={data} keyField="id" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
