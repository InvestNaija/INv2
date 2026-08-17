import TransactionsList from "../../../../components/organisms/transactions-list";

const Outgoing = () => {
    return (
        <>
              <div className="mt-[16px]">
                    <TransactionsList typeFilter="debit" />
                </div>
        </>
    )
}

export default Outgoing;