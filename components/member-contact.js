import styles from '@/styles/Home.module.css';
import { Avatar } from '@mui/material';

export default function MemberContact({ name, phone, designation, picname, avatar }) {
    let avatarDiv = <></>;
    if (avatar) {
        avatarDiv = <div className={styles.avatar}>
                        <Avatar src={picname ? `/${picname}.jpg` : ''}
                            alt={name}
                        ></Avatar>
                    </div>;
    }
    return (
        <div className={styles.card}>
            {avatarDiv}
            <div className={styles.membertext}>
                <div className={styles.designation}>{name}</div>
                <div className={styles.mb1} >{designation}</div>
                <div className={styles.mb1}>Cell: {phone}</div>
            </div>
        </div>
    )
}