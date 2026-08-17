import TransactionsList from "../../../../components/organisms/transactions-list";

const Incoming = () => {
    return (
        <>
              <div className="mt-[16px]">
                    <TransactionsList typeFilter="credit" />
                </div>
        </>
    )
}

export default Incoming;