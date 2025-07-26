import { DisputeRow, User } from "@/types";
import { format, subHours } from "date-fns";
import { useEffect, useState } from 'react'

import avatarGroup from '../../public/maskGroup.svg';
import { faker } from '@faker-js/faker';

export const mockUsers = (length = 12, status?: User['status']): User[] =>
    Array.from({ length }).map((_, i) => ({
        id: (faker.string.alpha(4) + faker.string.numeric(4) + faker.string.alpha(1)).toLowerCase(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        status: status ?? ['active', 'restricted', 'blocked'][faker.number.int({ min: 0, max: 2 })] as User['status'],
        avatarUrl: avatarGroup.src || '/placeholder.svg',
        createdAt: format(subHours(new Date(), (length - i) * 12), 'd MMMM yyyy : HH:mm:ss'),
    }));

export const mockDisputes = (length = 12, status?: DisputeRow['status']): DisputeRow[] => {
    return Array.from({ length }).map((_, i) => {
        const parties = mockUsers(faker.number.int({ min: 2, max: 3 }), 'active')
        return {
            name: parties[0].name,
            ticket: (faker.string.alpha(4) + faker.string.numeric(4) + faker.string.alpha(1)).toLowerCase(),
            userId: parties[0].id,
            email: parties[0].email,
            amount: faker.commerce.price({ min: 700, max: 900, dec: 0 }),
            status: status ?? ['active', 'unassigned', 'resolved'][faker.number.int({ min: 0, max: 2 })] as DisputeRow['status'],
            parties,
            createdAt: format(subHours(new Date(), (length - i) * 12), 'd MMMM yyyy : HH:mm:ss'),
        }
    });
}

export const useMockDisputes = (length = 12, status?: DisputeRow['status']) => {
    const [loading, setLoading] = useState(false)
    const [filtering, setFiltering] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [initialized, setInitialized] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [originalDisputes] = useState(() => mockDisputes(length, status))
    const [filteredDisputes, setFilteredDisputes] = useState<DisputeRow[]>([])

    useEffect(() => {
        if (!initialized) {
            setLoading(true)
            const timeout = setTimeout(() => {
                setLoading(false)
                setFilteredDisputes(originalDisputes)
                setInitialized(true)
            }, 3200)

            return () => clearTimeout(timeout)
        }
    }, [initialized, originalDisputes])

    const search = async (str: string, key?: 'name' | 'date'): Promise<DisputeRow[]> => {
        setFiltering(true)
        if (key === 'date') {
            setSelectedDate(str)
        } else {
            setSearchTerm(str)
        }

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                let data: DisputeRow[] = []

                if (key === 'date') {
                    data = originalDisputes.filter(
                        e => (!str || format(e.createdAt, 'd MMMM yyyy') === format(str, 'd MMMM yyyy')) &&
                            (!searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.ticket.includes(searchTerm))
                    )
                } else {
                    data = originalDisputes.filter(
                        e => (e.name.toLowerCase().includes(str.toLowerCase()) || e.ticket.includes(str)) &&
                            (!selectedDate || format(e.createdAt, 'd MMMM yyyy') === format(selectedDate, 'd MMMM yyyy'))
                    )
                }
                resolve(data)
                setFilteredDisputes(data)
                setFiltering(false)
                clearTimeout(timeout)
            }, 3200)
        })
    }

    const filter = async (status: DisputeRow['status']): Promise<DisputeRow[]> => {
        setFiltering(true)
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                const data = originalDisputes.filter(e => e.status === status)
                resolve(data)
                setFilteredDisputes(data)
                setFiltering(false)
                clearTimeout(timeout)
            }, 3200)
        })
    }

    return {
        disputes: filteredDisputes,
        selectedDate,
        initialized,
        searchTerm,
        filtering,
        loading,
        search,
        filter,
    }
}


// export const useDisputListLoadingSimulator = () => {
//     const [loading, setLoading] = useState(false)
//     const [originalDisputes] = useState(() => mockDisputes(length, status))

//     const send = async (): Promise<{
//         data: DisputeRow[],
//     }> => {
//         setLoading(true)
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 const {
//                     disputes: data,
//                     searchTerm,
//                     selectedDate,
//                     search,
//                 } = useMockDisputes(10);

//                 setLoading(false)
//                 setData(disputes)

//                 resolve({
//                     data: disputes,
//                 })
//             }, 3200);
//         })
//     }

//     return {
//         send,
//         loading
//     }
// }

export const simulateDisputResolution = async (dispute: DisputeRow, recipient: User): Promise<{
    data: DisputeRow,
    recipient: User,
}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            dispute.status = 'resolved'

            resolve({
                data: dispute,
                recipient,
            })
        }, 3200);
    })
}
