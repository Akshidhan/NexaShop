import './detailCard.scss'

const DetailCard = ({ name, icon, detail }) => {
  return (
    <div className='detailCard w-full h-[10rem] flex justify-between items-center bg-gray-300 p-4 rounded-md shadow-md'>
        <div className="left flex flex-col justify-center gap-4">
            <p className='text-xl'>{name}</p>
            <p className='text-3xl font-semibold'>{detail}</p>
        </div>
        <div>
            <p>{icon}</p>
        </div>
    </div>
  )
}

export default DetailCard