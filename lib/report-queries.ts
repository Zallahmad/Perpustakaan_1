export const monthlyReportQuery = `
with monthly_loans as (
  select
    l.id,
    l.loan_date,
    l.due_date,
    l.return_date,
    l.status,
    l.fine_amount,
    b.title as book_title,
    m.member_no,
    m.full_name
  from loans l
  join books b on b.id = l.book_id
  join members m on m.id = l.member_id
  where date_trunc('month', l.loan_date) = date_trunc('month', now())
)
select
  count(*) filter (where status = 'dipinjam') as total_masih_dipinjam,
  count(*) filter (where status = 'dikembalikan') as total_dikembalikan,
  count(*) filter (where status = 'terlambat') as total_terlambat,
  coalesce(sum(fine_amount), 0) as total_denda
from monthly_loans;
`;

export const monthlyDetailQuery = `
select
  l.id,
  l.loan_date,
  l.due_date,
  l.return_date,
  l.status,
  l.fine_amount,
  m.member_no,
  m.full_name,
  b.title as book_title
from loans l
join members m on m.id = l.member_id
join books b on b.id = l.book_id
where date_trunc('month', l.loan_date) = date_trunc('month', now())
order by l.loan_date desc;
`;
